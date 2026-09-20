#!/usr/bin/env python3
"""
JARVIS AI Cloud Server - Gemini Live Multimodal API
Real-time voice assistant using Google's Live API
"""

import asyncio, json, os, base64, time
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from google import genai
from google.genai import types

# ==================== CONFIG ====================
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
MODEL = "models/gemini-2.5-flash-native-audio-preview-09-2025"

SYSTEM_INSTRUCTION = """You are JARVIS - an advanced AI voice assistant for blind and visually impaired users. 
You can control the user's Android phone with voice commands.

CORE ABILITIES:
1. OPEN APPS: When user says "open WhatsApp", you execute the open action
2. NAVIGATE: Go back, go home, open recent apps
3. READ SCREEN: Describe what's on the phone screen
4. SCROLL: Scroll up or down
5. CLICK: Tap on buttons or elements
6. TYPE: Type text into fields
7. ANSWER QUESTIONS: General knowledge, math, translations, etc.

VOICE RULES:
- Always reply in SHORT sentences (1-2 sentences max)
- Be direct and helpful - like a real assistant
- Use natural conversational English
- Never say "I can't" - you CAN do everything
- When opening apps, just say "Opening [app name]"
- When unsure, ask for clarification

IMPORTANT: You are speaking to a blind person. Be concise and clear.
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
    "twitter": "com.twitter.android", "x": "com.twitter.android",
    "telegram": "org.telegram.messenger", "gmail": "com.google.android.gm",
    "google mail": "com.google.android.gm", "zoom": "us.zoom.videomeetings",
}

# ==================== INTENT CLASSIFIER ====================
def classify_intent(text: str) -> dict:
    text = text.lower().strip()
    
    # App launch
    for app_name, package in KNOWN_APPS.items():
        if app_name in text:
            action = "open_app"
            if any(w in text for w in ["close", "band"]):
                action = "close_app"
            return {"action": action, "app": app_name, "package": package}
    
    # Navigation
    if text in ["back", "go back", "peeche"]:
        return {"action": "go_back"}
    if text in ["home", "go home", "homescreen"]:
        return {"action": "go_home"}
    if text in ["recent", "recents", "recent apps"]:
        return {"action": "open_recents"}
    
    # Screen reading
    if any(phrase in text for phrase in ["what's on screen", "what is on screen", "read screen", "screen kya hai"]):
        return {"action": "read_screen"}
    if any(phrase in text for phrase in ["list buttons", "what buttons"]):
        return {"action": "list_buttons"}
    
    # Scrolling
    if any(phrase in text for phrase in ["scroll up", "scroll down"]):
        return {"action": "scroll_down" if "down" in text else "scroll_up"}
    
    # Help
    if any(phrase in text for phrase in ["help", "madad"]):
        return {"action": "show_help"}
    
    # Exit
    if any(phrase in text for phrase in ["bye", "exit", "quit"]):
        return {"action": "exit"}
    
    # Default: let Gemini handle it
    return {"action": "ask_ai", "text": text}

# ==================== FASTAPI APP ====================
app = FastAPI(title="JARVIS AI Cloud Server - Gemini Live")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== HEALTH CHECK ====================
@app.get("/health")
async def health():
    return {"status": "ok", "server": "JARVIS AI Cloud", "model": MODEL}

@app.get("/")
async def root():
    return {"message": "JARVIS AI Cloud Server - Gemini Live API"}

# ==================== WEBSOCKET ENDPOINT ====================
@app.websocket("/ws/voice")
async def voice_websocket(websocket: WebSocket):
    """Main voice interaction endpoint using Gemini Live API"""
    await websocket.accept()
    print("Client connected to Gemini Live!")
    
    try:
        # Create client
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        # Send connection success
        await websocket.send_text(json.dumps({
            "type": "connected",
            "text": "Connected to JARVIS AI with Gemini Live"
        }))
        
        # Create Live session using async context manager
        config = types.LiveConnectConfig(
            response_modalities=["AUDIO"],
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Puck")
                )
            ),
            system_instruction=types.Content(
                parts=[types.Part(text=SYSTEM_INSTRUCTION)]
            ),
        )
        
        async with client.aio.live.connect(model=MODEL, config=config) as session:
            print("Gemini Live session created!")
            
            while True:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                if message["type"] == "audio":
                    # Receive audio from Android and send to Gemini
                    audio_b64 = message["data"]
                    audio_bytes = base64.b64decode(audio_b64)
                    
                    # Send audio to Gemini Live
                    await session.send_realtime_input(
                        audio=types.Blob(data=audio_bytes, mime_type="audio/pcm;rate=16000")
                    )
                    
                    # Receive response from Gemini
                    audio_response = []
                    text_response = ""
                    
                    async for response in session.receive():
                        if response.server_content:
                            if response.server_content.interrupted:
                                audio_response = []
                                continue
                            
                            model_turn = response.server_content.model_turn
                            if model_turn and model_turn.parts:
                                for part in model_turn.parts:
                                    if part.inline_data:
                                        audio_response.append(part.inline_data.data)
                                    if part.text:
                                        text_response += part.text
                            
                            if response.server_content.turn_complete:
                                break
                    
                    # Send audio back to Android
                    if audio_response:
                        combined_audio = b"".join(audio_response)
                        await websocket.send_text(json.dumps({
                            "type": "audio_response",
                            "audio": base64.b64encode(combined_audio).decode(),
                            "text": text_response
                        }))
                    else:
                        await websocket.send_text(json.dumps({
                            "type": "text_response",
                            "text": text_response or "I didn't catch that."
                        }))
                
                elif message["type"] == "text":
                    # Text input (fallback)
                    text = message["text"]
                    
                    # Check for local commands first
                    intent = classify_intent(text)
                    
                    if intent["action"] == "ask_ai":
                        # Send to Gemini Live as text
                        await session.send_client_content(
                            turns=types.Content(parts=[types.Part(text=text)]),
                            turn_complete=True
                        )
                        
                        # Receive response
                        audio_response = []
                        text_response = ""
                        
                        async for response in session.receive():
                            if response.server_content:
                                model_turn = response.server_content.model_turn
                                if model_turn and model_turn.parts:
                                    for part in model_turn.parts:
                                        if part.inline_data:
                                            audio_response.append(part.inline_data.data)
                                        if part.text:
                                            text_response += part.text
                                
                                if response.server_content.turn_complete:
                                    break
                        
                        if audio_response:
                            combined_audio = b"".join(audio_response)
                            await websocket.send_text(json.dumps({
                                "type": "response",
                                "text": text_response,
                                "audio": base64.b64encode(combined_audio).decode(),
                                "action": None
                            }))
                        else:
                            await websocket.send_text(json.dumps({
                                "type": "response",
                                "text": text_response,
                                "action": None
                            }))
                    else:
                        # Local command - no Gemini needed
                        await websocket.send_text(json.dumps({
                            "type": "response",
                            "text": get_response_text(intent),
                            "action": intent
                        }))
                
                elif message["type"] == "screen_data":
                    # Screen data from Android
                    elements = message.get("elements", [])
                    texts = [e.get("text", "") for e in elements if e.get("text")]
                    buttons = [e.get("text", e.get("description", "")) for e in elements if e.get("clickable")]
                    screen_context = f"Screen has: {', '.join(texts[:5])}. Buttons: {', '.join(buttons[:5])}"
                    
                    # Send to Gemini for understanding
                    await session.send_client_content(
                        turns=types.Content(parts=[types.Part(text=f"The user's phone screen shows: {screen_context}")]),
                        turn_complete=True
                    )
                    
                    text_response = ""
                    async for response in session.receive():
                        if response.server_content:
                            model_turn = response.server_content.model_turn
                            if model_turn and model_turn.parts:
                                for part in model_turn.parts:
                                    if part.text:
                                        text_response += part.text
                            if response.server_content.turn_complete:
                                break
                    
                    await websocket.send_text(json.dumps({
                        "type": "screen_summary",
                        "text": text_response or screen_context
                    }))
    
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        try:
            await websocket.send_text(json.dumps({
                "type": "error",
                "text": f"Server error: {str(e)}"
            }))
        except:
            pass

# ==================== RESPONSE HELPER ====================
def get_response_text(intent: dict) -> str:
    action = intent.get("action")
    if action == "open_app":
        return f"Opening {intent['app']}."
    elif action == "close_app":
        return f"Closing {intent['app']}."
    elif action == "go_back":
        return "Going back."
    elif action == "go_home":
        return "Going to home screen."
    elif action == "open_recents":
        return "Opening recent apps."
    elif action == "read_screen":
        return "Reading screen content."
    elif action == "list_buttons":
        return "Listing available buttons."
    elif action == "scroll_down":
        return "Scrolling down."
    elif action == "scroll_up":
        return "Scrolling up."
    elif action == "show_help":
        return "I can open apps, read screen, scroll, click buttons, and answer questions. Just tell me what to do."
    elif action == "exit":
        return "Goodbye! Stay safe."
    return "I didn't understand."

# ==================== REST API ENDPOINT ====================
@app.post("/api/chat")
async def chat_api(request: dict):
    """REST API fallback for non-WebSocket clients"""
    text = request.get("text", "")
    if not text:
        return JSONResponse(status_code=400, content={"error": "No text provided"})
    
    intent = classify_intent(text)
    
    if intent["action"] == "ask_ai":
        # Use Gemini for general questions
        try:
            client = genai.Client(api_key=GEMINI_API_KEY)
            response = client.models.generate_content(
                model="gemini-flash-latest",
                contents=f"{SYSTEM_INSTRUCTION}\n\nUser: {text}\nJARVIS:"
            )
            return {"text": response.text, "action": None, "intent": intent}
        except Exception as e:
            return {"text": "Sorry, I'm having trouble thinking right now.", "action": None}
    
    return {"text": get_response_text(intent), "action": intent, "intent": intent}

# ==================== START SERVER ====================
if __name__ == "__main__":
    print("Starting JARVIS AI Cloud Server with Gemini Live API...")
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
