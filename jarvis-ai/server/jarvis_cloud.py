#!/usr/bin/env python3
"""
JARVIS AI Cloud Server - Direct Gemini Live WebSocket
No SDK dependency - raw WebSocket connection to Gemini
"""

import asyncio, json, os, base64
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import websockets

# ==================== CONFIG ====================
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_HOST = "generativelanguage.googleapis.com"
GEMINI_MODEL = "models/gemini-2.5-flash-native-audio-preview-09-2025"
GEMINI_URI = f"wss://{GEMINI_HOST}/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key={GEMINI_API_KEY}"

SYSTEM_INSTRUCTION = """You are JARVIS - an advanced AI voice assistant for blind and visually impaired users.

You can control the user's Android phone with voice commands:
- Open apps: "open WhatsApp", "open Chrome"
- Navigate: "go back", "go home"  
- Read screen: "what's on screen"
- Scroll: "scroll up", "scroll down"
- Answer questions: anything else

RULES:
- Reply in SHORT sentences (1-2 sentences max)
- Be direct and helpful
- When opening apps, just say "Opening [app name]"
- You are speaking to a blind person - be concise and clear
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
}

def classify_intent(text: str) -> dict:
    text = text.lower().strip()
    for app_name, package in KNOWN_APPS.items():
        if app_name in text:
            action = "close_app" if any(w in text for w in ["close", "band"]) else "open_app"
            return {"action": action, "app": app_name, "package": package}
    if text in ["back", "go back", "peeche"]: return {"action": "go_back"}
    if text in ["home", "go home", "homescreen"]: return {"action": "go_home"}
    if any(phrase in text for phrase in ["what's on screen", "read screen", "screen kya hai"]):
        return {"action": "read_screen"}
    if "scroll down" in text: return {"action": "scroll_down"}
    if "scroll up" in text: return {"action": "scroll_up"}
    if any(phrase in text for phrase in ["help", "madad"]): return {"action": "show_help"}
    if any(phrase in text for phrase in ["bye", "exit", "quit"]): return {"action": "exit"}
    return {"action": "ask_ai", "text": text}

def get_response_text(intent: dict) -> str:
    action = intent.get("action")
    responses = {
        "open_app": f"Opening {intent['app']}.",
        "close_app": f"Closing {intent['app']}.",
        "go_back": "Going back.",
        "go_home": "Going to home screen.",
        "read_screen": "Reading screen content.",
        "scroll_down": "Scrolling down.",
        "scroll_up": "Scrolling up.",
        "show_help": "I can open apps, read screen, scroll, and answer questions.",
        "exit": "Goodbye!"
    }
    return responses.get(action, "I didn't understand.")

# ==================== FASTAPI APP ====================
app = FastAPI(title="JARVIS AI Cloud")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
async def health():
    return {"status": "ok", "model": GEMINI_MODEL}

@app.get("/")
async def root():
    return {"message": "JARVIS AI Cloud Server"}

# ==================== WEBSOCKET + GEMINI LIVE ====================
@app.websocket("/ws/voice")
async def voice_websocket(websocket: WebSocket):
    await websocket.accept()
    print("Client connected!")
    
    try:
        # Connect to Gemini Live via raw WebSocket
        async with websockets.connect(GEMINI_URI) as gemini_ws:
            print("Connected to Gemini Live!")
            
            # Send setup message to Gemini
            setup_msg = {
                "setup": {
                    "model": GEMINI_MODEL,
                    "generation_config": {
                        "response_modalities": ["AUDIO"],
                        "speech_config": {
                            "voice_config": {
                                "prebuilt_voice_config": {
                                    "voice_name": "Puck"
                                }
                            }
                        }
                    },
                    "system_instruction": {
                        "parts": [{"text": SYSTEM_INSTRUCTION}]
                    }
                }
            }
            
            await gemini_ws.send(json.dumps(setup_msg))
            
            # Wait for setup response
            raw_response = await gemini_ws.recv()
            setup_response = json.loads(raw_response.decode("ascii"))
            print("Gemini session started!")
            
            # Notify client
            await websocket.send_text(json.dumps({
                "type": "connected",
                "text": "Connected to JARVIS AI"
            }))
            
            async def receive_from_gemini():
                """Background: receive from Gemini, send to client"""
                try:
                    async for raw_response in gemini_ws:
                        response = json.loads(raw_response.decode("ascii"))
                        
                        try:
                            parts = response["serverContent"]["modelTurn"]["parts"]
                            for part in parts:
                                if "inlineData" in part:
                                    audio_b64 = part["inlineData"]["data"]
                                    await websocket.send_text(json.dumps({
                                        "type": "audio",
                                        "audio": audio_b64
                                    }))
                                if "text" in part:
                                    await websocket.send_text(json.dumps({
                                        "type": "text",
                                        "text": part["text"]
                                    }))
                        except KeyError:
                            pass
                        
                        if response.get("serverContent", {}).get("turnComplete"):
                            await websocket.send_text(json.dumps({"type": "turn_complete"}))
                except Exception as e:
                    print(f"Gemini receive error: {e}")
            
            # Start background receiver
            receive_task = asyncio.create_task(receive_from_gemini())
            
            try:
                while True:
                    data = await websocket.receive_text()
                    message = json.loads(data)
                    
                    if message["type"] == "audio":
                        # Stream audio to Gemini
                        audio_b64 = message["data"]
                        
                        msg = {
                            "realtime_input": {
                                "media_chunks": [{
                                    "mime_type": "audio/pcm;rate=16000",
                                    "data": audio_b64
                                }]
                            }
                        }
                        await gemini_ws.send(json.dumps(msg))
                    
                    elif message["type"] == "text":
                        text = message["text"]
                        intent = classify_intent(text)
                        
                        if intent["action"] == "ask_ai":
                            # Send text to Gemini
                            msg = {
                                "client_content": {
                                    "turn_complete": True,
                                    "turns": [{"role": "user", "parts": [{"text": text}]}]
                                }
                            }
                            await gemini_ws.send(json.dumps(msg))
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
                        screen_context = f"Phone screen: {', '.join(texts[:5])}. Buttons: {', '.join(buttons[:5])}"
                        
                        msg = {
                            "client_content": {
                                "turn_complete": True,
                                "turns": [{"role": "user", "parts": [{"text": screen_context}]}]
                            }
                        }
                        await gemini_ws.send(json.dumps(msg))
            
            except WebSocketDisconnect:
                print("Client disconnected")
            finally:
                receive_task.cancel()
    
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        try:
            await websocket.send_text(json.dumps({"type": "error", "text": str(e)}))
        except:
            pass

# ==================== REST API ====================
@app.post("/api/chat")
async def chat_api(request: dict):
    text = request.get("text", "")
    if not text:
        return {"error": "No text"}
    
    intent = classify_intent(text)
    if intent["action"] == "ask_ai":
        return {"text": "Use WebSocket for AI responses", "action": None}
    
    return {"text": get_response_text(intent), "action": intent}

if __name__ == "__main__":
    print("Starting JARVIS AI Cloud Server...")
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
