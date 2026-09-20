#!/usr/bin/env python3
"""
JARVIS AI Cloud Server - Gemini REST API
Android handles STT + TTS locally, server handles AI brain
"""

import json, os, base64
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import requests

# ==================== CONFIG ====================
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-preview:generateContent?key={GEMINI_API_KEY}"

SYSTEM_INSTRUCTION = """You are JARVIS - an advanced AI voice assistant for blind and visually impaired users.

You can control the user's Android phone with voice commands:
- Open apps: "open WhatsApp", "open Chrome"
- Navigate: "go back", "go home"  
- Read screen: "what's on screen"
- Scroll: "scroll up", "scroll down"
- Answer questions: anything else

RULES:
- Reply in SHORT spoken sentences (1-2 sentences max)
- Be direct and helpful
- When opening apps, just say "Opening [app name]"
- You are speaking to a blind person - be concise and clear
- NEVER use markdown, bullets, or formatting - just plain spoken text
"""

# ==================== APPS DATABASE ====================
KNOWN_APPS = {
    "whatsapp": "com.whatsapp", "instagram": "com.instagram.android",
    "facebook": "com.facebook.katana", "chrome": "com.android.chrome",
    "youtube": "com.google.android.youtube", "maps": "com.google.android.apps.maps",
    "camera": "com.android.camera", "photos": "com.google.android.apps.photos",
    "messages": "com.google.android.apps.messaging", "phone": "com.android.dialer",
    "settings": "com.android.settings", "clock": "com.google.android.deskclock",
    "calculator": "com.google.android.calculator", "calendar": "com.google.android.calendar",
    "drive": "com.google.android.apps.docs", "files": "com.google.android.apps.nbu.files",
    "play store": "com.android.vending", "spotify": "com.spotify.music",
    "gmail": "com.google.android.gm", "telegram": "org.telegram.messenger",
    "camera": "com.android.camera", "gallery": "com.google.android.apps.photos",
    "weather": "com.google.android.apps.weather", "notes": "com.google.android.apps.keep",
    "contacts": "com.google.android.contacts", "clock": "com.google.android.deskclock",
    "alarm": "com.google.android.deskclock", "timer": "com.google.android.deskclock",
    "stopwatch": "com.google.android.deskclock", "world clock": "com.google.android.deskclock",
    "radio": "com.google.android.music", "podcast": "com.google.android.apps.podcasts",
    "news": "com.google.android.apps.magazines", "books": "com.google.android.apps.books",
    "translate": "com.google.android.apps.translate", "wallet": "com.google.android.apps.pay",
    "fitness": "com.google.android.apps.fitness", "health": "com.google.android.apps.health",
    "wallet": "com.google.android.apps.nbu.files", "file manager": "com.google.android.apps.nbu.files",
    "recorder": "com.google.android.apps.recorder", "tasks": "com.google.android.apps.tasks",
    "keep": "com.google.android.apps.keep", "docs": "com.google.android.apps.docs",
    "sheets": "com.google.android.apps.docs.editors.sheets", "slides": "com.google.android.apps.docs.editors.slides",
    "meet": "com.google.android.apps.meetings", "chat": "com.google.android.apps.tachyon",
    "duo": "com.google.android.apps.tachyon", "meet": "com.google.android.apps.meetings",
}

# ==================== INTENT CLASSIFIER ====================
def classify_intent(text: str) -> dict:
    text = text.lower().strip()
    
    # App launch
    for app_name, package in KNOWN_APPS.items():
        if app_name in text:
            action = "close_app" if any(w in text for w in ["close", "band"]) else "open_app"
            return {"action": action, "app": app_name, "package": package}
    
    # Navigation
    if text in ["back", "go back", "peeche"]: return {"action": "go_back"}
    if text in ["home", "go home", "homescreen"]: return {"action": "go_home"}
    if text in ["recent", "recents", "recent apps"]: return {"action": "open_recents"}
    
    # Screen reading
    if any(phrase in text for phrase in ["what's on screen", "read screen", "screen kya hai", "kya hai", "what is this"]):
        return {"action": "read_screen"}
    if any(phrase in text for phrase in ["list buttons", "what buttons", "kya kar sakte"]):
        return {"action": "list_buttons"}
    
    # Scrolling
    if "scroll down" in text or "neeche" in text: return {"action": "scroll_down"}
    if "scroll up" in text or "upar" in text: return {"action": "scroll_up"}
    
    # Help
    if any(phrase in text for phrase in ["help", "madad", "kya kar sakta hai"]):
        return {"action": "show_help"}
    
    # Exit
    if any(phrase in text for phrase in ["bye", "exit", "quit", "band kar"]):
        return {"action": "exit"}
    
    # Default: send to Gemini
    return {"action": "ask_ai", "text": text}

# ==================== GEMINI LLM ====================
def ask_gemini(prompt: str, screen_context: str = "") -> str:
    try:
        full_prompt = f"{SYSTEM_INSTRUCTION}\n\n"
        if screen_context:
            full_prompt += f"Current phone screen: {screen_context}\n\n"
        full_prompt += f"User said: {prompt}\n\nJARVIS reply (short, spoken, no markdown):"
        
        payload = {
            "contents": [{"role": "user", "parts": [{"text": full_prompt}]}],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 150,
                "topP": 0.8,
            }
        }
        
        resp = requests.post(GEMINI_URL, json=payload, timeout=15)
        data = resp.json()
        
        if "candidates" in data and len(data["candidates"]) > 0:
            parts = data["candidates"][0].get("content", {}).get("parts", [])
            for part in parts:
                if "text" in part:
                    return part["text"].strip()[:200]
        
        return "I didn't understand that."
    except Exception as e:
        print(f"Gemini error: {e}")
        return "Sorry, I'm having trouble thinking right now."

# ==================== FASTAPI APP ====================
app = FastAPI(title="JARVIS AI Cloud")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
async def health():
    return {"status": "ok", "server": "JARVIS AI Cloud", "version": "2.0"}

@app.get("/")
async def root():
    return {"message": "JARVIS AI Cloud Server"}

# ==================== WEBSOCKET ENDPOINT ====================
@app.websocket("/ws/voice")
async def voice_websocket(websocket: WebSocket):
    await websocket.accept()
    print("Client connected!")
    screen_context = ""
    
    try:
        await websocket.send_text(json.dumps({
            "type": "connected",
            "text": "Connected to JARVIS AI"
        }))
        
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "text":
                text = message["text"]
                print(f"User: {text}")
                
                intent = classify_intent(text)
                print(f"Intent: {intent}")
                
                if intent["action"] == "ask_ai":
                    response_text = ask_gemini(text, screen_context)
                    await websocket.send_text(json.dumps({
                        "type": "response",
                        "text": response_text,
                        "action": None
                    }))
                else:
                    await websocket.send_text(json.dumps({
                        "type": "response",
                        "text": get_response_text(intent),
                        "action": intent
                    }))
            
            elif message["type"] == "screen_data":
                elements = message.get("elements", [])
                texts = [e.get("text", "") for e in elements if e.get("text")]
                buttons = [e.get("text", e.get("description", "")) for e in elements if e.get("clickable")]
                screen_context = f"Texts: {', '.join(texts[:8])}. Buttons: {', '.join(buttons[:5])}."
                
                await websocket.send_text(json.dumps({
                    "type": "screen_summary",
                    "text": f"Screen has {len(elements)} elements. Main content: {', '.join(texts[:3])}."
                }))
    
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"Error: {e}")

def get_response_text(intent: dict) -> str:
    action = intent.get("action")
    responses = {
        "open_app": f"Opening {intent['app']}.",
        "close_app": f"Closing {intent['app']}.",
        "go_back": "Going back.",
        "go_home": "Going to home screen.",
        "open_recents": "Opening recent apps.",
        "read_screen": "Reading screen content.",
        "list_buttons": "Listing available buttons.",
        "scroll_down": "Scrolling down.",
        "scroll_up": "Scrolling up.",
        "show_help": "I can open apps, read screen, scroll, click buttons, and answer questions. Just tell me what to do.",
        "exit": "Goodbye! Stay safe."
    }
    return responses.get(action, "I didn't understand. Please try again.")

# ==================== REST API ====================
@app.post("/api/chat")
async def chat_api(request: dict):
    text = request.get("text", "")
    screen = request.get("screen", "")
    if not text:
        return {"error": "No text"}
    
    intent = classify_intent(text)
    if intent["action"] == "ask_ai":
        response_text = ask_gemini(text, screen)
        return {"text": response_text, "action": None, "intent": intent}
    
    return {"text": get_response_text(intent), "action": intent, "intent": intent}

if __name__ == "__main__":
    print("Starting JARVIS AI Cloud Server...")
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
