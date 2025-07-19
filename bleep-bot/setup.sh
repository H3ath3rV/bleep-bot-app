#!/bin/bash

# Bleep Bot Setup Script
echo "=== Bleep Bot Setup ==="
echo "Setting up your video profanity filter application..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11 or later."
    exit 1
fi

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg is not installed. Please install FFmpeg first:"
    echo "   Ubuntu/Debian: sudo apt install ffmpeg"
    echo "   macOS: brew install ffmpeg"
    echo "   Windows: choco install ffmpeg"
    exit 1
fi

echo "✅ Python and FFmpeg are available"

# Create virtual environment
echo "📦 Creating Python virtual environment..."
/opt/homebrew/bin/python3.11 -m venv venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "  1. source venv/bin/activate"
echo "  2. python src/main.py"
echo "  3. Open http://localhost:5000 in your browser"
echo ""
echo "Note: First run will download Whisper model (~40MB)"
echo "Processing time depends on video length and your CPU."

