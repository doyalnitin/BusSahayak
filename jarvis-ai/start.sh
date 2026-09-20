#!/bin/bash
# JARVIS AI - Quick Start Script

echo "========================================="
echo "  JARVIS AI - Voice Assistant for Blind"
echo "========================================="
echo ""

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "[1/4] Starting Ollama..."
    ollama serve &
    sleep 3
else
    echo "[1/4] Ollama already running"
fi

# Check if Gemma model exists
if ! ollama list | grep -q "gemma2:2b"; then
    echo "[2/4] Downloading Gemma 2B..."
    ollama pull gemma2:2b
else
    echo "[2/4] Gemma 2B already installed"
fi

# Install Python dependencies
echo "[3/4] Installing Python dependencies..."
cd server
pip3 install -r requirements.txt

# Start server
echo "[4/4] Starting JARVIS AI Server..."
echo ""
echo "Server will start at: http://localhost:8000"
echo ""
echo "========================================="
echo "  NEXT STEPS:"
echo "  1. Open Android Studio"
echo "  2. Import android/ folder"
echo "  3. Build and install on phone"
echo "  4. Enable Accessibility Service"
echo "  5. Start talking!"
echo "========================================="
echo ""

python3 jarvis_server.py
