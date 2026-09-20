#!/usr/bin/env python3
"""
JARVIS AI Server - Voice Assistant Backend
Handles: Vision AI + STT + LLM + TTS + Action Planning
"""

import json, os, time, base64, subprocess, tempfile
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import requests

# ==================== CONFIG ====================
OLLAMA_URL = "http://localhost:11434/api/generate"
GEMMA_MODEL = "gemma2:2b"
VOSK_MODEL = os.path.expanduser("~/vosk-model-small-hi-0.22")
PIPER_MODEL = os.path.expanduser("~/piper-voices/en_US-lessac-medium.onnx")
SAMPLE_RATE = 16000

SYSTEM_PROMPT = """You are JARVIS - an advanced AI assistant for blind/visually impaired users.

CORE ABILITIES:
1. READ SCREEN: Describe what's on the phone screen
2. NAVIGATE: Open apps, click buttons, scroll, type text
3. SUMMARIZE: Read emails, messages, articles in short summary
4. ACTIONS: Reply to messages, fill forms, make calls
5. REMINDERS: Set reminders, alarms, calendar events

RESPONSE FORMAT:
- Always reply in SHORT spoken language (1-2 sentences)
- Be direct and helpful
- When user asks "what's on screen", describe the main elements
- When user wants to open an app, confirm and execute
- When reading messages, summarize first, then ask "read full?"

EXAMPLE CONVERSATIONS:
User: "What's on my screen?"
AI: "You're on Gmail inbox. 3 new emails. Want me to read them?"

User: "Open WhatsApp"
AI: "Opening WhatsApp. You have 5 unread messages."

User: "Read the first message"
AI: "Rahul says: Meeting at 5pm today. Want to reply?"

User: "Reply: I'll be there"
AI: "Message sent to Rahul: I'll be there"

User: "Go back"
AI: "Going back to previous screen."

IMPORTANT: Always confirm before executing actions like sending messages or making calls.
Keep responses under 30 words for voice output.
"""

# ==================== APPS DATABASE ====================
KNOWN_APPS = {
    "gmail": "com.google.android.gm",
    "google mail": "com.google.android.gm",
    "whatsapp": "com.whatsapp",
    "instagram": "com.instagram.android",
    "facebook": "com.facebook.katana",
    "chrome": "com.android.chrome",
    "browser": "com.android.chrome",
    "youtube": "com.google.android.youtube",
    "maps": "com.google.android.apps.maps",
    "camera": "com.android.camera",
    "gallery": "com.google.android.apps.photos",
    "photos": "com.google.android.apps.photos",
    "messages": "com.google.android.apps.messaging",
    "phone": "com.android.dialer",
    "call": "com.android.dialer",
    "settings": "com.android.settings",
    "clock": "com.google.android.deskclock",
    "alarm": "com.google.android.deskclock",
    "calculator": "com.google.android.calculator",
    "calendar": "com.google.android.calendar",
    "drive": "com.google.android.apps.docs",
    "files": "com.google.android.apps.nbu.files",
    "play store": "com.android.vending",
    "spotify": "com.spotify.music",
    "twitter": "com.twitter.android",
    "x": "com.twitter.android",
    "telegram": "org.telegram.messenger",
    "slack": "com.Slack",
    "teams": "com.microsoft.teams",
    "zoom": "us.zoom.videomeetings",
    "zoomer": "us.zoom.videomeetings",
}

# ==================== INTENT CLASSIFIER ====================
def classify_intent(text: str) -> dict:
    """Classify user intent from voice command"""
    text = text.lower().strip()

    # App launch
    for app_name, package in KNOWN_APPS.items():
        if app_name in text:
            action = "open_app"
            if any(w in text for w in ["close", "band"]):
                action = "close_app"
            return {"action": action, "app": app_name, "package": package}

    # Navigation
    if any(w in text for w in ["back", "peeche", "pichla"]):
        return {"action": "go_back"}
    if any(w in text for w in ["home", "homescreen", "main"]):
        return {"action": "go_home"}
    if any(w in text for w in ["recent", "recents", "recent apps"]):
        return {"action": "open_recents"}

    # Screen reading
    if any(w in text for w in ["what", "screen", "page", "kya hai", "kya dikh"]):
        return {"action": "read_screen"}
    if any(w in text for w in ["summarize", "summary", "short", "brief"]):
        return {"action": "summarize_screen"}
    if any(w in text for w in ["button", "buttons", "kya kar", "options"]):
        return {"action": "list_buttons"}

    # Reading messages
    if any(w in text for w in ["read", "padho", "sunao"]):
        return {"action": "read_content", "full": "full" in text}
    if any(w in text for w in ["email", "mail", "message", "sms"]):
        return {"action": "read_messages"}

    # Scrolling
    if any(w in text for w in ["scroll up", "upar", "neeche scroll"]):
        return {"action": "scroll_up"}
    if any(w in text for w in ["scroll down", "neeche", "aur neeche"]):
        return {"action": "scroll_down"}

    # Typing
    if any(w in text for w in ["type", "likho", "search"]):
        return {"action": "type_text", "text": text}

    # Clicking
    if any(w in text for w in ["click", "tap", "dabao", "press"]):
        return {"action": "click", "target": text}

    # Reply
    if any(w in text for w in ["reply", "jawaab", "bhejo"]):
        return {"action": "reply", "text": text}

    # Help
    if any(w in text for w in ["help", "madad", "kya kar sakta"]):
        return {"action": "show_help"}

    # Exit
    if any(w in text for w in ["bye", "exit", "quit", "band"]):
        return {"action": "exit"}

    # Default: ask AI
    return {"action": "ask_ai", "text": text}

# ==================== FASTAPI APP ====================
app = FastAPI(title="JARVIS AI Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== WEBSOCKET ENDPOINT ====================
@app.websocket("/ws/voice")
async def voice_websocket(websocket: WebSocket):
    """Main voice interaction endpoint"""
    await websocket.accept()
    print("Client connected!")

    try:
        while True:
            # Receive audio from Android app
            data = await websocket.receive_text()
            message = json.loads(data)

            if message["type"] == "audio":
                # STT: Convert audio to text
                text = await speech_to_text(message["data"])
                print(f"User said: {text}")

                if not text:
                    await websocket.send_text(json.dumps({
                        "type": "response",
                        "text": "I didn't catch that. Please try again.",
                        "action": None
                    }))
                    continue

                # Classify intent
                intent = classify_intent(text)
                print(f"Intent: {intent}")

                # Generate response and action
                response = await process_intent(intent, text)

                # TTS: Convert response to audio
                audio = await text_to_speech(response["text"])

                # Send back text + audio + action
                await websocket.send_text(json.dumps({
                    "type": "response",
                    "text": response["text"],
                    "action": response.get("action"),
                    "audio": audio
                }))

            elif message["type"] == "screen_data":
                # Receive screen data from Android
                elements = message["elements"]
                summary = summarize_screen(elements)

                await websocket.send_text(json.dumps({
                    "type": "screen_summary",
                    "text": summary
                }))

    except WebSocketDisconnect:
        print("Client disconnected")

# ==================== INTENT PROCESSOR ====================
async def process_intent(intent: dict, original_text: str) -> dict:
    """Process classified intent and generate response"""

    action = intent.get("action")

    if action == "open_app":
        return {
            "text": f"Opening {intent['app']}.",
            "action": {"type": "launch_app", "package": intent["package"]}
        }

    elif action == "go_back":
        return {
            "text": "Going back.",
            "action": {"type": "go_back"}
        }

    elif action == "go_home":
        return {
            "text": "Going to home screen.",
            "action": {"type": "go_home"}
        }

    elif action == "read_screen":
        return {
            "text": "Reading screen content now.",
            "action": {"type": "read_screen"}
        }

    elif action == "list_buttons":
        return {
            "text": "Listing available buttons.",
            "action": {"type": "list_buttons"}
        }

    elif action == "scroll_down":
        return {
            "text": "Scrolling down.",
            "action": {"type": "scroll_down"}
        }

    elif action == "scroll_up":
        return {
            "text": "Scrolling up.",
            "action": {"type": "scroll_up"}
        }

    elif action == "click":
        return {
            "text": f"Clicking {intent.get('target', 'button')}.",
            "action": {"type": "click", "target": intent.get("target")}
        }

    elif action == "type_text":
        return {
            "text": "Type what you want to search.",
            "action": {"type": "type_text", "text": intent.get("text", "")}
        }

    elif action == "reply":
        return {
            "text": f"Sending reply.",
            "action": {"type": "reply", "text": intent.get("text", "")}
        }

    elif action == "show_help":
        return {
            "text": "I can open apps, read screen, scroll, click buttons, type text, and reply to messages. Just tell me what to do.",
            "action": None
        }

    elif action == "exit":
        return {
            "text": "Goodbye! Stay safe.",
            "action": {"type": "exit"}
        }

    elif action == "ask_ai":
        # Use Gemma for general questions
        response = ask_gemma(original_text)
        return {"text": response, "action": None}

    else:
        return {
            "text": "I didn't understand. Please try again.",
            "action": None
        }

# ==================== GEMMA LLM ====================
def ask_gemma(prompt: str) -> str:
    """Ask Gemma a question"""
    try:
        resp = requests.post(OLLAMA_URL, json={
            "model": GEMMA_MODEL,
            "prompt": prompt,
            "system": SYSTEM_PROMPT,
            "stream": False
        }, timeout=30)
        data = resp.json()
        return data.get("response", "I didn't understand that.")
    except Exception as e:
        return "Sorry, I'm having trouble thinking right now."

# ==================== SPEECH TO TEXT ====================
async def speech_to_text(audio_base64: str) -> str:
    """Convert audio to text using VOSK"""
    try:
        import soundfile as sf
        import io
        from vosk import Model, KaldiRecognizer

        model = Model(VOSK_MODEL)
        rec = KaldiRecognizer(model, SAMPLE_RATE)

        # Decode base64 audio
        audio_bytes = base64.b64decode(audio_base64)

        # Process audio
        rec.AcceptWaveform(audio_bytes)
        result = json.loads(rec.Result())
        return result.get("text", "")

    except Exception as e:
        print(f"STT error: {e}")
        return ""

# ==================== TEXT TO SPEECH ====================
async def text_to_speech(text: str) -> str:
    """Convert text to audio using Piper"""
    try:
        wav_file = tempfile.mktemp(suffix=".wav")
        subprocess.run(
            ["piper", "--model", PIPER_MODEL, "--output_file", wav_file],
            input=text.encode("utf-8"),
            capture_output=True,
            timeout=15
        )

        if os.path.exists(wav_file) and os.path.getsize(wav_file) > 0:
            with open(wav_file, "rb") as f:
                audio_data = f.read()
            os.remove(wav_file)
            return base64.b64encode(audio_data).decode("utf-8")

        return ""

    except Exception as e:
        print(f"TTS error: {e}")
        return ""

# ==================== SCREEN SUMMARIZER ====================
def summarize_screen(elements: list) -> str:
    """Summarize what's on screen based on UI elements"""
    if not elements:
        return "Screen is empty."

    texts = [e.get("text", "") for e in elements if e.get("text")]
    buttons = [e.get("text", e.get("description", "button")) for e in elements if e.get("clickable")]

    summary = f"Screen has {len(elements)} elements. "

    if texts:
        summary += f"Main content: {', '.join(texts[:5])}. "

    if buttons:
        summary += f"Buttons available: {', '.join(buttons[:5])}. "

    return summary

# ==================== START SERVER ====================
if __name__ == "__main__":
    print("Starting JARVIS AI Server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
