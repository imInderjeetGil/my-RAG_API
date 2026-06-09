@echo off
set "ROOT_DIR=%~dp0"

:: 1. Start Ollama in the background
start /b ollama run gemma3:4b

:: 2. Open Windows Terminal with split panes
wt -p "Command Prompt" --title "Backend" cmd /k "cd /d "%ROOT_DIR%rag-backend" && venv\Scripts\activate && uvicorn main:app --reload" ; ^
split-pane -V -p "Command Prompt" --title "Frontend" cmd /k "cd /d "%ROOT_DIR%rag-frontend" && npm run dev"