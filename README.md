# Bleep Bot - Full-Stack Video Profanity Filter

This repository contains the complete source code for Bleep Bot, a full-stack web application designed to automatically detect and censor profanity in video files.

The project is structured as a **monorepo** containing two main packages:

-   **/bleep-bot**: The Python backend built with **Flask**. It handles file uploads, video processing with FFmpeg, and profanity detection using OpenAI Whisper.
-   **/bleep-bot-frontend**: The **React** and **Vite** frontend that provides a modern, user-friendly interface for uploading and managing videos.

---

## 🚀 Quick Start

To run the application, you will need to set up both the backend and frontend. All setup instructions are located in the main README file inside the `bleep-bot` folder.

➡️ **[View Setup Instructions](./bleep-bot/README.md)**

---

This project was developed to demonstrate a modern, full-stack workflow including API communication, background processing, and a decoupled frontend architecture.