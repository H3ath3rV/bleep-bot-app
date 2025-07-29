# Bleep Bot - Professional Video Profanity Filter

This is the Bleep Bot application, designed to detect and censor profane language in video files with high precision. This version includes a robust backend for video processing and a user-friendly React frontend with customizable filter settings.

## ✨ Key Features

- **🎯 Precise Word-Level Detection**: Uses OpenAI Whisper with word timestamps for exact profanity location.
- **🔇 Automatic Muting**: Profanity is silenced, just clean audio.
- **🧠 Adjustable AI Model**: Select from different Whisper model sizes (`tiny`, `base`, `small`) to balance speed and accuracy.
- **⚙️ Configurable Filter Settings**: Adjust sensitivity levels and enable/disable specific profanity categories.
- **🔒 100% Local Processing**: All video processing happens on your server - no external uploads.
- **🎛️ Professional Interface**: Clean, modern React frontend with real-time progress tracking.
- **📁 Broad Format Support**: Supports common video files like MP4, MOV, MKV, etc.
- **📊 Customizable Categories**: Choose from Profanity & Curse Words, Blasphemy & Religious, Mild Language, and Slurs & Hate Speech.
- **🌐 Cross-Platform**: Works on Windows, macOS, and Linux.

---

## 🚀 Installation & Usage

### Prerequisites

Ensure you have the following installed:
1.  **Python 3.10+**
2.  **Node.js 18+** (which includes npm)
3.  **FFmpeg**: Must be available in your system's PATH.
    -   **macOS:** `brew install ffmpeg`
    -   **Ubuntu/Debian:** `sudo apt install ffmpeg`
    -   **Windows:** `choco install ffmpeg` or download from the official site.

### 1. Set Up the Backend

First, set up and run the Python server.

```bash
# Navigate to the backend directory
cd bleep-bot

# Create a virtual environment and activate it
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Start the server
python src/main.py