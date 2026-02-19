# 🧠 Your AI with local Memory 

A local-first AI chat system with persistent memory, designed as a base for digital souls/assistants.

## 🌟 Features

- **Local AI Brain:** Powered by [Ollama](https://ollama.com/) (Default: `qwen2.5:3b`).
- **Persistent Memory:**
  - **System Identity:** Edit the AI's "soul" (personality/instructions) in real-time.
  - **Daily Logs:** Automatically saves every conversation to `server/memories/YYYY-MM-DD.md`.
- **Context Awareness:** The AI reads its System Identity + Recent Chat History before every reply.
- **Dual-Stack Architecture:**
  - **Frontend:** React + Vite (Fast, responsive chat UI).
  - **Backend:** Express (Handles file I/O and AI communication).

## 🛠️ Prerequisites

1.  **Node.js** (v18 or higher)
2.  **Ollama** (for local AI)
    -   Download from [ollama.com](https://ollama.com)
    -   Pull the model:
        ```bash
        ollama pull qwen2.5:3b (you can change to your model)
        ```

## 🚀 Quick Start

You need **two terminal windows** to run the system.

### Terminal 1: The Brain (Backend)
```bash
cd server
npm install
npm start
```
*Runs on `http://localhost:3001`*

### Terminal 2: The Face (Frontend)
```bash
# In the root folder
npm install
npm run dev
```
*Runs on `http://localhost:5173`*

## ⚙️ Configuration

The AI settings are in `server/.env`.

**Default (Local):**
```ini
AI_BASE_URL=http://localhost:11434/v1
AI_API_KEY=ollama
AI_MODEL=qwen2.5:3b
```

**To use Cloud (OpenAI):**
1.  Open `server/.env`
2.  Comment out the Local section.
3.  Uncomment the OpenAI section and add your key.

## 📂 Project Structure

-   `src/`: React Frontend code.
-   `server/`: Express Backend code.
-   `server/memories/`: **The Memory Bank.**
    -   `SYSTEM.md`: The core personality file.
    -   `YYYY-MM-DD.md`: Daily chat logs.
 
## Demo 
<img width="1919" height="943" alt="Screenshot 2026-02-19 162730" src="https://github.com/user-attachments/assets/867b172d-fbaf-4bd6-ab87-5d0b990ef685" />


## 🤝 Contributing

Feel free to add **Vector Search** (RAG) or **Voice/TTS** modules next!
