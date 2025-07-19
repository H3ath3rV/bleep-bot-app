# Bleep Bot - Full-Stack Video Profanity Filter

This repository contains the complete source code for Bleep Bot, a full-stack web application designed to automatically detect and censor profanity in video files.

The project is structured as a **monorepo** containing two main packages:

-   **/bleep-bot**: The Python backend built with **Flask**. It handles file uploads, video processing with FFmpeg, and profanity detection using OpenAI Whisper.
-   **/bleep-bot-frontend**: The **React** and **Vite** frontend that provides a modern, user-friendly interface for uploading and managing videos.

---

## 🚀 Quick Start

To run the application, you will need to run both the backend and frontend servers.

### 1. Run the Backend

Navigate to the backend directory and follow the instructions in its README file:
➡️ **[Backend Instructions](./bleep-bot/README.md)**

### 2. Run the Frontend

In a new terminal, navigate to the frontend directory and follow the instructions in its README file (which is the same as the backend's for setup):
➡️ **[Frontend Instructions](./bleep-bot-frontend/README.md)** (Note: The `README.md` for frontend setup is located in the backend folder.)

---

This project was developed to demonstrate a modern, full-stack workflow including API communication, background processing, and a decoupled frontend architecture.