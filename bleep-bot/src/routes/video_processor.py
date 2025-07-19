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

# Global variable to hold the loaded Whisper model
WHISPER_MODEL = None

# Categorized profanity word lists with common variations for better accuracy
PROFANITY_CATEGORIES = {
    'profanity_curse': [
        'damn', 'damnit', 'damned', 'hell', 'crap', 'shit', 'shitty', 'shitting', 
        'fuck', 'fucking', 'fucked', 'bitch', 'bitching', 'ass', 'asses', 
        'bastard', 'bastards', 'piss', 'pissed', 'asshole', 'assholes', 
        'dickhead', 'dickheads', 'motherfucker', 'motherfuckers', 'cocksucker', 
        'cocksuckers', 'bullshit'
    ],
    'blasphemy_religious': [
        'goddamn', 'god damn', 'jesus', 'christ', 'jesus christ', 'holy shit'
    ],
    'mild_language': [
        'darn', 'dang', 'crud', 'frick', 'shoot'
    ],
    'slurs_hate': [
        # This category is disabled by default
    ]
}

# Default filter settings, now correctly configured to only mute profanity and blasphemy.
DEFAULT_FILTER_SETTINGS = {
    'sensitivity_level': 8,  # Using a higher sensitivity for precise, exact matching.
    'enabled_categories': ['profanity_curse', 'blasphemy_religious'],
    'word_padding': 0.25      # Increased padding from 0.1 to 0.25 for a smoother mute.
}

def load_model_on_startup(model_size="tiny"): # Options: tiny, base, small, medium, large
    """Loads the Whisper model into the global variable."""
    global WHISPER_MODEL
    if WHISPER_MODEL is None:
        WHISPER_MODEL = whisper.load_model(model_size)

class VideoProcessor:
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp()
    
    def extract_audio_from_video(self, video_path):
        """Extract audio from video file using ffmpeg"""
        try:
            audio_path = os.path.join(self.temp_dir, f"audio_{uuid.uuid4().hex}.wav")
            cmd = [
                'ffmpeg', '-i', video_path, 
                '-vn', '-acodec', 'pcm_s16le', 
                '-ar', '16000', '-ac', '1', 
                audio_path, '-y'
            ]
            subprocess.run(cmd, check=True, capture_output=True, text=True)
            return audio_path
        except subprocess.CalledProcessError as e:
            error_details = f"FFmpeg command failed.\nCommand: {' '.join(e.cmd)}\nStderr: {e.stderr}"
            raise Exception(f"Failed to extract audio: {error_details}")
    
    def transcribe_audio(self, audio_path):
        """Transcribe audio using the pre-loaded Whisper model."""
        if WHISPER_MODEL is None:
            # Fallback in case the model wasn't pre-loaded
            load_model_on_startup()
        result = WHISPER_MODEL.transcribe(audio_path, word_timestamps=True)
        return result
    
    def get_active_word_list(self, filter_settings):
        """Get combined word list based on enabled categories"""
        active_words = []
        for category in filter_settings.get('enabled_categories', []):
            if category in PROFANITY_CATEGORIES:
                active_words.extend(PROFANITY_CATEGORIES[category])
        return list(set(active_words))
    
    def detect_profanity_precise(self, transcription, filter_settings):
        """Detect profanity with precise word-level timestamps using a strict matching logic."""
        profanity_segments = []
        active_words = self.get_active_word_list(filter_settings)
        word_padding = filter_settings.get('word_padding', 0.25) # Ensure fallback uses the new default
        
        for segment in transcription['segments']:
            if 'words' in segment:
                for word_info in segment['words']:
                    # Normalize the detected word from Whisper for comparison.
                    word_text_clean = re.sub(r'[^\w\s]', '', word_info['word']).strip().lower()
                    
                    # Use a strict equality check against our word list to prevent false positives.
                    if word_text_clean in active_words:
                        start_time = max(0, word_info['start'] - word_padding)
                        end_time = word_info['end'] + word_padding
                        
                        profanity_segments.append({
                            'start': start_time,
                            'end': end_time,
                            'text': word_info['word'],
                            'word': word_text_clean,
                            'timestamp': word_info['start'],
                            'confidence': word_info.get('probability', 0.9),
                            'category': self.get_word_category(word_text_clean)
                        })
    
        return profanity_segments

    def get_word_category(self, profane_word):
        """Get the category of a profane word from our clean list."""
        for category, words in PROFANITY_CATEGORIES.items():
            if profane_word in words:
                return category
        return 'unknown'
    
    def create_clean_video(self, video_path, profanity_segments):
        """Create clean video by MUTING profanity segments with precise timing."""
        output_path = os.path.join(self.temp_dir, f"clean_{uuid.uuid4().hex}.mp4")
        
        if not profanity_segments:
            return video_path
        
        merged_segments = self.merge_overlapping_segments(profanity_segments)
        
        filter_parts = []
        for segment in merged_segments:
            start_time = segment['start']
            end_time = segment['end']
            filter_parts.append(
                f"volume=0:enable='between(t,{start_time:.3f},{end_time:.3f})'"
            )
        
        filter_complex = ",".join(filter_parts)
        
        try:
            cmd = [
                'ffmpeg', '-i', video_path,
                '-af', filter_complex,
                '-c:v', 'copy',
                '-c:a', 'aac',
                '-avoid_negative_ts', 'make_zero',
                output_path, '-y'
            ]
            subprocess.run(cmd, check=True, capture_output=True, text=True)
            return output_path
        except subprocess.CalledProcessError as e:
            error_details = f"FFmpeg command failed.\nCommand: {' '.join(e.cmd)}\nStderr: {e.stderr}"
            raise Exception(f"Failed to create clean video: {error_details}")
    
    def merge_overlapping_segments(self, segments):
        """Merge overlapping or very close profanity segments."""
        if not segments:
            return []
        
        sorted_segments = sorted(segments, key=lambda x: x['start'])
        merged = [sorted_segments[0]]
        
        for current in sorted_segments[1:]:
            last_merged = merged[-1]
            if current['start'] <= last_merged['end'] + 0.2:
                last_merged['end'] = max(last_merged['end'], current['end'])
                last_merged['text'] += f" + {current['text']}"
            else:
                merged.append(current)
        
        return merged

# Global processor instance
processor = VideoProcessor()

@video_bp.route('/upload', methods=['POST'])
@cross_origin()
def upload_video():
    """Handle video upload and return file info"""
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        file = request.files['video']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        filename = f"{uuid.uuid4().hex}_{file.filename}"
        filepath = os.path.join(processor.temp_dir, filename)
        file.save(filepath)
        
        try:
            cmd = ['ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_format', filepath]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            info = json.loads(result.stdout)
            duration = float(info['format']['duration'])
        except:
            duration = 0
        
        return jsonify({
            'success': True,
            'file_id': filename,
            'original_name': file.filename,
            'size': os.path.getsize(filepath),
            'duration': duration
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@video_bp.route('/process', methods=['POST'])
@cross_origin()
def process_video():
    """Process video to detect and mute profanity with configurable filters"""
    try:
        data = request.get_json()
        file_id = data.get('file_id')
        filter_settings = data.get('filter_settings', DEFAULT_FILTER_SETTINGS)
        
        if not file_id:
            return jsonify({'error': 'No file_id provided'}), 400
        
        video_path = os.path.join(processor.temp_dir, file_id)
        if not os.path.exists(video_path):
            return jsonify({'error': 'Video file not found'}), 404
        
        audio_path = processor.extract_audio_from_video(video_path)
        transcription = processor.transcribe_audio(audio_path)
        profanity_segments = processor.detect_profanity_precise(transcription, filter_settings)
        clean_video_path = processor.create_clean_video(video_path, profanity_segments)
        
        clean_filename = f"clean_{file_id}"
        clean_filepath = os.path.join(processor.temp_dir, clean_filename)
        
        if clean_video_path != video_path:
            os.rename(clean_video_path, clean_filepath)
        else:
            import shutil
            shutil.copy2(video_path, clean_filepath)
        
        message = 'No profanity detected'
        if len(profanity_segments) > 0:
            message = f'Found and muted {len(profanity_segments)} profanity instances'

        return jsonify({
            'success': True,
            'profanity_detected': len(profanity_segments),
            'segments': profanity_segments,
            'clean_file_id': clean_filename,
            'filter_settings_used': filter_settings,
            'message': message
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@video_bp.route('/filter-settings', methods=['GET'])
@cross_origin()
def get_filter_settings():
    """Get available filter categories and default settings"""
    return jsonify({
        'categories': {
            'profanity_curse': {
                'name': 'Profanity & Curse Words',
                'description': 'Common profanity and curse words',
                'word_count': len(PROFANITY_CATEGORIES['profanity_curse'])
            },
            'blasphemy_religious': {
                'name': 'Blasphemy & Religious',
                'description': 'Religious references and blasphemy',
                'word_count': len(PROFANITY_CATEGORIES['blasphemy_religious'])
            },
            'mild_language': {
                'name': 'Mild Language',
                'description': 'Mild inappropriate language',
                'word_count': len(PROFANITY_CATEGORIES['mild_language'])
            },
            'slurs_hate': {
                'name': 'Slurs & Hate Speech',
                'description': 'Slurs and hate speech (disabled by default)',
                'word_count': len(PROFANITY_CATEGORIES['slurs_hate'])
            }
        },
        'default_settings': DEFAULT_FILTER_SETTINGS,
        'sensitivity_levels': {
            1: 'Very Lenient - Not Recommended',
            5: 'Moderate - Exact Matches',
            8: 'Strict - Exact Matches (Recommended)',
            10: 'Very Strict - Exact Matches'
        }
    })

@video_bp.route('/download/<file_id>')
@cross_origin()
def download_video(file_id):
    """Download processed video file"""
    try:
        filepath = os.path.join(processor.temp_dir, file_id)
        if not os.path.exists(filepath):
            return jsonify({'error': 'File not found'}), 404
        
        return send_file(
            filepath,
            as_attachment=True,
            download_name=f"clean_video.mp4",
            mimetype='video/mp4'
        )
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@video_bp.route('/status')
@cross_origin()
def status():
    """Check if video processing service is available"""
    try:
        subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
        ffmpeg_ok = True
    except Exception:
        ffmpeg_ok = False

    return jsonify({
        'status': 'ready' if ffmpeg_ok else 'error',
        'ffmpeg_available': ffmpeg_ok,
        'whisper_model_loaded': WHISPER_MODEL is not None,
        'supported_categories': list(PROFANITY_CATEGORIES.keys())
    })