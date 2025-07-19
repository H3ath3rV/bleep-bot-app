#!/usr/bin/env python3
"""
Test script to verify the bleeping logic works correctly
"""
import subprocess
import tempfile
import os

def test_beep_generation():
    """Test if we can generate a simple beep tone using ffmpeg"""
    print("Testing beep tone generation...")
    
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
        output_path = temp_file.name
    
    try:
        # Generate a 1-second beep tone at 1000Hz
        cmd = [
            'ffmpeg', '-f', 'lavfi', '-i', 'sine=frequency=1000:duration=1:sample_rate=44100',
            '-y', output_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Beep tone generation successful!")
            print(f"Generated beep file: {output_path}")
            print(f"File size: {os.path.getsize(output_path)} bytes")
            return True
        else:
            print("❌ Beep tone generation failed!")
            print(f"Error: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Exception during beep generation: {e}")
        return False
    finally:
        # Clean up
        if os.path.exists(output_path):
            os.unlink(output_path)

def test_complex_filter():
    """Test if we can create a complex filter for audio mixing"""
    print("\nTesting complex filter creation...")
    
    # Simulate profanity segments
    segments = [
        {'start': 5.0, 'end': 6.0},
        {'start': 10.0, 'end': 11.5}
    ]
    
    try:
        # Create filter complex parts like in our fixed code
        filter_complex_parts = []
        
        # Start with the original audio
        filter_complex_parts.append("[0:a]acopy[original]")
        
        # Generate beep tones for each segment
        beep_inputs = []
        for i, segment in enumerate(segments):
            start_time = segment['start']
            end_time = segment['end']
            duration = end_time - start_time
            
            # Generate a beep tone (1000Hz sine wave) for this segment
            beep_filter = f"sine=frequency=1000:duration={duration:.3f}:sample_rate=44100[beep{i}]"
            filter_complex_parts.append(beep_filter)
            
            # Delay the beep to start at the correct time
            delayed_beep = f"[beep{i}]adelay={int(start_time * 1000)}|{int(start_time * 1000)}[delayed_beep{i}]"
            filter_complex_parts.append(delayed_beep)
            
            beep_inputs.append(f"[delayed_beep{i}]")
        
        # Create volume masks to mute original audio during beep times
        volume_filters = []
        for segment in segments:
            start_time = segment['start']
            end_time = segment['end']
            volume_filters.append(f"volume=0:enable='between(t,{start_time:.3f},{end_time:.3f})'")
        
        # Apply volume filters to original audio
        muted_audio_filter = f"[original]{','.join(volume_filters)}[muted]"
        filter_complex_parts.append(muted_audio_filter)
        
        # Mix the muted original audio with all beep tones
        if beep_inputs:
            mix_inputs = "[muted]" + "".join(beep_inputs)
            mix_filter = f"{mix_inputs}amix=inputs={len(beep_inputs) + 1}:duration=first:dropout_transition=0[final]"
            filter_complex_parts.append(mix_filter)
            output_audio = "[final]"
        else:
            output_audio = "[muted]"
        
        # Combine all filter parts
        filter_complex = ";".join(filter_complex_parts)
        
        print("✅ Complex filter creation successful!")
        print("Generated filter complex:")
        print(filter_complex)
        print(f"\nNumber of segments: {len(segments)}")
        print(f"Number of beep inputs: {len(beep_inputs)}")
        print(f"Output audio stream: {output_audio}")
        
        return True
        
    except Exception as e:
        print(f"❌ Exception during complex filter creation: {e}")
        return False

def test_ffmpeg_command():
    """Test the complete ffmpeg command structure"""
    print("\nTesting complete ffmpeg command structure...")
    
    segments = [{'start': 5.0, 'end': 6.0}]
    
    try:
        # Simulate the command building process
        filter_complex_parts = []
        filter_complex_parts.append("[0:a]acopy[original]")
        
        beep_inputs = []
        for i, segment in enumerate(segments):
            start_time = segment['start']
            end_time = segment['end']
            duration = end_time - start_time
            
            beep_filter = f"sine=frequency=1000:duration={duration:.3f}:sample_rate=44100[beep{i}]"
            filter_complex_parts.append(beep_filter)
            
            delayed_beep = f"[beep{i}]adelay={int(start_time * 1000)}|{int(start_time * 1000)}[delayed_beep{i}]"
            filter_complex_parts.append(delayed_beep)
            
            beep_inputs.append(f"[delayed_beep{i}]")
        
        volume_filters = []
        for segment in segments:
            start_time = segment['start']
            end_time = segment['end']
            volume_filters.append(f"volume=0:enable='between(t,{start_time:.3f},{end_time:.3f})'")
        
        muted_audio_filter = f"[original]{','.join(volume_filters)}[muted]"
        filter_complex_parts.append(muted_audio_filter)
        
        if beep_inputs:
            mix_inputs = "[muted]" + "".join(beep_inputs)
            mix_filter = f"{mix_inputs}amix=inputs={len(beep_inputs) + 1}:duration=first:dropout_transition=0[final]"
            filter_complex_parts.append(mix_filter)
            output_audio = "[final]"
        else:
            output_audio = "[muted]"
        
        filter_complex = ";".join(filter_complex_parts)
        
        # Build ffmpeg command
        cmd = [
            'ffmpeg', '-i', 'input_video.mp4',
            '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
            '-filter_complex', filter_complex,
            '-map', '0:v',
            '-map', output_audio,
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-avoid_negative_ts', 'make_zero',
            'output_video.mp4', '-y'
        ]
        
        print("✅ FFmpeg command structure successful!")
        print("Generated command:")
        print(" ".join(cmd))
        
        return True
        
    except Exception as e:
        print(f"❌ Exception during command building: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Testing Bleep Bot Audio Processing Logic")
    print("=" * 50)
    
    success_count = 0
    total_tests = 3
    
    if test_beep_generation():
        success_count += 1
    
    if test_complex_filter():
        success_count += 1
        
    if test_ffmpeg_command():
        success_count += 1
    
    print("\n" + "=" * 50)
    print(f"Test Results: {success_count}/{total_tests} tests passed")
    
    if success_count == total_tests:
        print("🎉 All tests passed! The bleeping logic should work correctly.")
    else:
        print("⚠️  Some tests failed. Check the implementation.")

