# File: bleep-bot/src/routes/video_processor.py

import os
import tempfile
import json
import subprocess
from flask import Blueprint, request, jsonify, send_file
from flask_cors import cross_origin
import whisper
import uuid
import re

video_bp = Blueprint('video', __name__)

WHISPER_MODEL = None

PROFANITY_CATEGORIES = {
    'profanity_curse': ['damn', 'damnit', 'damned', 'hell', 'crap', 'shit', 'shitty', 'shitting', 'fuck', 'fucking', 'fucked', 'bitch', 'bitching', 'ass', 'asses', 'bastard', 'bastards', 'piss', 'pissed', 'asshole', 'assholes', 'dickhead', 'dickheads', 'motherfucker', 'motherfuckers', 'cocksucker', 'cocksuckers', 'bullshit'],
    'blasphemy_religious': ['goddamn', 'god damn', 'jesus', 'christ', 'jesus christ', 'holy shit'],
    'mild_language': ['darn', 'dang', 'crud', 'frick', 'shoot'],
    'slurs_hate': []
}

DEFAULT_FILTER_SETTINGS = {
    'enabled_categories': ['profanity_curse', 'blasphemy_religious'],
    'word_padding': 0.25,
    'confidence_threshold': 0.75
}

def load_model_on_startup(model_size="base"):
    global WHISPER_MODEL
    if WHISPER_MODEL is None:
        WHISPER_MODEL = whisper.load_model(model_size)

class VideoProcessor:
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp()
    
    def extract_audio_from_video(self, video_path):
        try:
            audio_path = os.path.join(self.temp_dir, f"audio_{uuid.uuid4().hex}.wav")
            cmd = ['ffmpeg', '-i', video_path, '-vn', '-acodec', 'pcm_s16le', '-ar', '16000', '-ac', '1', audio_path, '-y']
            subprocess.run(cmd, check=True, capture_output=True, text=True)
            return audio_path
        except subprocess.CalledProcessError as e:
            raise Exception(f"Failed to extract audio: {e.stderr}")
    
    def transcribe_audio(self, audio_path):
        if WHISPER_MODEL is None: load_model_on_startup()
        return WHISPER_MODEL.transcribe(audio_path, word_timestamps=True)
    
    def get_active_word_list(self, filter_settings):
        active_words = []
        for category in filter_settings.get('enabled_categories', []):
            if category in PROFANITY_CATEGORIES:
                active_words.extend(PROFANITY_CATEGORIES[category])
        return list(set(active_words))
    
    def detect_profanity_precise(self, transcription, filter_settings):
        profanity_segments = []
        active_words = self.get_active_word_list(filter_settings)
        word_padding = filter_settings.get('word_padding', 0.25)
        confidence_threshold = filter_settings.get('confidence_threshold', 0.75)

        for segment in transcription.get('segments', []):
            for word_info in segment.get('words', []):
                word_text_clean = re.sub(r'[^\w\s]', '', word_info.get('word', '')).strip().lower()
                confidence = word_info.get('probability', 1.0)
                
                if word_text_clean in active_words and confidence >= confidence_threshold:
                    start_time = max(0, word_info['start'] - word_padding)
                    end_time = word_info['end'] + word_padding
                    profanity_segments.append({
                        'start': start_time, 'end': end_time, 'text': word_info['word'],
                        'word': word_text_clean, 'timestamp': word_info['start'],
                        'confidence': confidence
                    })
        return profanity_segments
    
    def create_clean_video(self, video_path, profanity_segments):
        output_path = os.path.join(self.temp_dir, f"clean_{uuid.uuid4().hex}.mp4")
        if not profanity_segments: return video_path
        
        merged_segments = self.merge_overlapping_segments(profanity_segments)
        filter_parts = [f"volume=0:enable='between(t,{seg['start']:.3f},{seg['end']:.3f})'" for seg in merged_segments]
        filter_complex = ",".join(filter_parts)
        
        try:
            cmd = ['ffmpeg', '-i', video_path, '-af', filter_complex, '-c:v', 'copy', '-c:a', 'aac', '-avoid_negative_ts', 'make_zero', output_path, '-y']
            subprocess.run(cmd, check=True, capture_output=True, text=True)
            return output_path
        except subprocess.CalledProcessError as e:
            raise Exception(f"Failed to create clean video: {e.stderr}")
    
    def merge_overlapping_segments(self, segments):
        if not segments: return []
        sorted_segments = sorted(segments, key=lambda x: x['start'])
        merged = [sorted_segments[0]]
        for current in sorted_segments[1:]:
            last = merged[-1]
            if current['start'] <= last['end'] + 0.2:
                last['end'] = max(last['end'], current['end'])
                last['text'] += f" + {current['text']}"
            else:
                merged.append(current)
        return merged

processor = VideoProcessor()

@video_bp.route('/upload', methods=['POST'])
@cross_origin()
def upload_video():
    try:
        file = request.files['video']
        filename = f"{uuid.uuid4().hex}_{file.filename}"
        filepath = os.path.join(processor.temp_dir, filename)
        file.save(filepath)
        return jsonify({'success': True, 'file_id': filename})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@video_bp.route('/process', methods=['POST'])
@cross_origin()
def process_video():
    try:
        data = request.get_json()
        file_id = data.get('file_id')
        if not file_id: return jsonify({'error': 'No file_id provided'}), 400
        
        # --- Import the new Job model and db instance ---
        from ..models.job import Job
        from ..models.user import db

        video_path = os.path.join(processor.temp_dir, file_id)
        if not os.path.exists(video_path): return jsonify({'error': 'Video file not found'}), 404
        
        settings = DEFAULT_FILTER_SETTINGS.copy()
        user_settings = data.get('filter_settings', {})
        settings.update(user_settings)
        
        audio_path = processor.extract_audio_from_video(video_path)
        transcription = processor.transcribe_audio(audio_path)
        profanity_segments = processor.detect_profanity_precise(transcription, settings)
        clean_video_path = processor.create_clean_video(video_path, profanity_segments)
        
        clean_filename = f"clean_{file_id}"
        clean_filepath = os.path.join(processor.temp_dir, clean_filename)
        if clean_video_path == video_path:
            import shutil
            shutil.copy(video_path, clean_filepath)
        else:
            os.rename(clean_video_path, clean_filepath)
        
        message = 'No profanity detected.'
        if profanity_segments:
            message = f'Found and muted {len(profanity_segments)} profanity instances.'

        # --- Create and save the job record to the database ---
        new_job = Job(original_filename=file_id, profanity_detected_count=len(profanity_segments))
        db.session.add(new_job)
        db.session.commit()

        return jsonify({
            'success': True, 'profanity_detected': len(profanity_segments),
            'segments': profanity_segments, 'clean_file_id': clean_filename, 'message': message
        })
    except Exception as e:
        print(f"An error occurred during processing: {e}")
        return jsonify({'error': str(e)}), 500

@video_bp.route('/download/<file_id>')
@cross_origin()
def download_video(file_id):
    try:
        filepath = os.path.join(processor.temp_dir, file_id)
        if not os.path.exists(filepath): return jsonify({'error': 'File not found'}), 404
        return send_file(filepath, as_attachment=True, download_name="clean_video.mp4", mimetype='video/mp4')
    except Exception as e:
        return jsonify({'error': str(e)}), 500