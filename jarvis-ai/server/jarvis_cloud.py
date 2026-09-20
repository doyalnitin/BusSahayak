#!/usr/bin/env python3
"""
JARVIS AI Cloud Server - Voice Assistant Backend
Uses Gemini API for LLM (free 15 RPM) + Android's built-in STT/TTS
"""

import json, os, time, base64, re
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import requests

# ==================== CONFIG ====================
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"

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
- Keep responses under 30 words for voice output.

IMPORTANT: Always confirm before executing actions like sending messages or making calls.
"""

# ==================== APPS DATABASE ====================
KNOWN_APPS = {
    "gmail": "com.google.android.gm", "google mail": "com.google.android.gm",
    "whatsapp": "com.whatsapp", "instagram": "com.instagram.android",
    "facebook": "com.facebook.katana", "chrome": "com.android.chrome",
    "browser": "com.android.chrome", "youtube": "com.google.android.youtube",
    "maps": "com.google.android.apps.maps", "camera": "com.android.camera",
    "gallery": "com.google.android.apps.photos", "photos": "com.google.android.apps.photos",
    "messages": "com.google.android.apps.messaging", "phone": "com.android.dialer",
    "call": "com.android.dialer", "settings": "com.android.settings",
    "clock": "com.google.android.deskclock", "alarm": "com.google.android.deskclock",
    "calculator": "com.google.android.calculator", "calendar": "com.google.android.calendar",
    "drive": "com.google.android.apps.docs", "files": "com.google.android.apps.nbu.files",
    "play store": "com.android.vending", "spotify": "com.spotify.music",
    "twitter": "com.twitter.android", "x": "com.twitter.android",
    "telegram": "org.telegram.messenger", "slack": "com.Slack",
    "teams": "com.microsoft.teams", "zoom": "us.zoom.videomeetings",
}

# ==================== FASTAPI APP ====================
app = FastAPI(title="JARVIS AI Cloud Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== HEALTH CHECK ====================
@app.get("/health")
async def health():
    return {"status": "ok", "server": "JARVIS AI Cloud", "version": "1.0"}

@app.get("/")
async def root():
    return {"message": "JARVIS AI Cloud Server is running"}

# ==================== INTENT CLASSIFIER ====================
def classify_intent(text: str) -> dict:
    text = text.lower().strip()
    
    for app_name, package in KNOWN_APPS.items():
        if app_name in text:
            action = "open_app"
            if any(w in text for w in ["close", "band"]):
                action = "close_app"
            return {"action": action, "app": app_name, "package": package}
    
    if any(w in text for w in ["back", "peeche", "pichla"]):
        return {"action": "go_back"}
    if any(w in text for w in ["home", "homescreen", "main"]):
        return {"action": "go_home"}
    if any(w in text for w in ["recent", "recents", "recent apps"]):
        return {"action": "open_recents"}
    if any(w in text for w in ["what", "screen", "page", "kya hai", "kya dikh"]):
        return {"action": "read_screen"}
    if any(w in text for w in ["summarize", "summary", "short", "brief"]):
        return {"action": "summarize_screen"}
    if any(w in text for w in ["button", "buttons", "kya kar", "options"]):
        return {"action": "list_buttons"}
    if any(w in text for w in ["read", "padho", "sunao"]):
        return {"action": "read_content", "full": "full" in text}
    if any(w in text for w in ["email", "mail", "message", "sms"]):
        return {"action": "read_messages"}
    if any(w in text for w in ["scroll up", "upar", "neeche scroll"]):
        return {"action": "scroll_up"}
    if any(w in text for w in ["scroll down", "neeche", "aur neeche"]):
        return {"action": "scroll_down"}
    if any(w in text for w in ["type", "likho", "search"]):
        return {"action": "type_text", "text": text}
    if any(w in text for w in ["click", "tap", "dabao", "press"]):
        return {"action": "click", "target": text}
    if any(w in text for w in ["reply", "jawaab", "bhejo"]):
        return {"action": "reply", "text": text}
    if any(w in text for w in ["help", "madad", "kya kar sakta"]):
        return {"action": "show_help"}
    if any(w in text for w in ["bye", "exit", "quit", "band"]):
        return {"action": "exit"}
    
    return {"action": "ask_ai", "text": text}

# ==================== GEMINI LLM ====================
def ask_gemini(prompt: str, screen_context: str = "") -> str:
    try:
        full_prompt = f"{SYSTEM_PROMPT}\n\n"
        if screen_context:
            full_prompt += f"Current screen content: {screen_context}\n\n"
        full_prompt += f"User: {prompt}\nJARVIS:"
        
        payload = {
            "contents": [{"parts": [{"text": full_prompt}]}],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 100,
                "topP": 0.8,
            }
        }
        
        resp = requests.post(GEMINI_URL, json=payload, timeout=15)
        data = resp.json()
        
        if "candidates" in data and len(data["candidates"]) > 0:
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return text.strip()[:200]
        
        return "I didn't understand that."
    except Exception as e:
        print(f"Gemini error: {e}")
        return "Sorry, I'm having trouble thinking right now."

# ==================== INTENT PROCESSOR ====================
def process_intent(intent: dict, original_text: str, screen_context: str = "") -> dict:
    action = intent.get("action")
    
    if action == "open_app":
        return {
            "text": f"Opening {intent['app']}.",
            "action": {"type": "launch_app", "package": intent["package"]}
        }
    elif action == "close_app":
        return {
            "text": f"Closing {intent['app']}.",
            "action": {"type": "close_app", "package": intent["package"]}
        }
    elif action == "go_back":
        return {"text": "Going back.", "action": {"type": "go_back"}}
    elif action == "go_home":
        return {"text": "Going to home screen.", "action": {"type": "go_home"}}
    elif action == "open_recents":
        return {"text": "Opening recent apps.", "action": {"type": "open_recents"}}
    elif action == "read_screen":
        return {"text": "Reading screen content now.", "action": {"type": "read_screen"}}
    elif action == "list_buttons":
        return {"text": "Listing available buttons.", "action": {"type": "list_buttons"}}
    elif action == "scroll_down":
        return {"text": "Scrolling down.", "action": {"type": "scroll_down"}}
    elif action == "scroll_up":
        return {"text": "Scrolling up.", "action": {"type": "scroll_up"}}
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
            "text": "Sending reply.",
            "action": {"type": "reply", "text": intent.get("text", "")}
        }
    elif action == "show_help":
        return {
            "text": "I can open apps, read screen, scroll, click buttons, type text, and reply to messages. Just tell me what to do.",
            "action": None
        }
    elif action == "exit":
        return {"text": "Goodbye! Stay safe.", "action": {"type": "exit"}}
    elif action == "ask_ai":
        response = ask_gemini(original_text, screen_context)
        return {"text": response, "action": None}
    else:
        return {"text": "I didn't understand. Please try again.", "action": None}

# ==================== WEBSOCKET ENDPOINT ====================
@app.websocket("/ws/voice")
async def voice_websocket(websocket: WebSocket):
    await websocket.accept()
    print("Client connected!")
    screen_context = ""
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "text":
                text = message["text"]
                print(f"User said: {text}")
                
                intent = classify_intent(text)
                print(f"Intent: {intent}")
                
                response = process_intent(intent, text, screen_context)
                
                await websocket.send_text(json.dumps({
                    "type": "response",
                    "text": response["text"],
                    "action": response.get("action")
                }))
            
            elif message["type"] == "screen_data":
                elements = message.get("elements", [])
                texts = [e.get("text", "") for e in elements if e.get("text")]
                buttons = [e.get("text", e.get("description", "")) for e in elements if e.get("clickable")]
                screen_context = f"Texts: {', '.join(texts[:10])}. Buttons: {', '.join(buttons[:10])}."
                
                await websocket.send_text(json.dumps({
                    "type": "screen_summary",
                    "text": screen_context
                }))
            
            elif message["type"] == "audio":
                text = message.get("text", "")
                if text:
                    intent = classify_intent(text)
                    response = process_intent(intent, text, screen_context)
                    await websocket.send_text(json.dumps({
                        "type": "response",
                        "text": response["text"],
                        "action": response.get("action")
                    }))
    
    except WebSocketDisconnect:
        print("Client disconnected")

# ==================== REST API ENDPOINT (for non-WebSocket clients) ====================
@app.post("/api/chat")
async def chat_api(request: dict):
    text = request.get("text", "")
    screen = request.get("screen", "")
    
    if not text:
        return JSONResponse(status_code=400, content={"error": "No text provided"})
    
    intent = classify_intent(text)
    response = process_intent(intent, text, screen)
    
    return {
        "text": response["text"],
        "action": response.get("action"),
        "intent": intent
    }

# ==================== START SERVER ====================
if __name__ == "__main__":
    print("Starting JARVIS AI Cloud Server...")
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
