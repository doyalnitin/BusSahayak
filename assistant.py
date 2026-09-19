#!/usr/bin/env python3
"""
BusSahayak AI Voice Assistant
VOSK (STT) + Gemma (LLM) + Piper (TTS)
100% Offline - No Internet Needed
"""

import json, queue, os, subprocess, tempfile, sys, time
import sounddevice as sd
from vosk import Model, KaldiRecognizer

# ============== CONFIG ==============
VOSK_MODEL = os.path.expanduser("~/vosk-model-small-hi-0.22")
OLLAMA_URL = "http://localhost:11434/api/generate"
GEMMA_MODEL = "gemma2"
PIPER_MODEL = os.path.expanduser("~/piper-voices/hi_IN-swara-medium.onnx")
SAMPLE_RATE = 16000
SYSTEM_PROMPT = """You are BusSahayak - a friendly Hindi voice assistant for blind bus passengers.
Rules:
- Reply ONLY in Hindi (Devanagari script)
- Keep replies SHORT (1-2 sentences max)
- Be warm and helpful
- Help with bus booking, route info, seat selection
- If user says "bye" or "exit", say goodbye
- Always end with a helpful question if needed"""

# ============== VOSK (STT) ==============
print("Loading VOSK model...")
try:
    vosk_model = Model(VOSK_MODEL)
    rec = KaldiRecognizer(vosk_model, SAMPLE_RATE)
    print("VOSK loaded!")
except Exception as e:
    print(f"VOSK error: {e}")
    sys.exit(1)

q = queue.Queue()

def audio_callback(indata, frames, time_info, status):
    q.put(bytes(indata))

def listen():
    """Listen to microphone and return text"""
    print("\nListening... (speak now)")
    with sd.RawInputStream(
        samplerate=SAMPLE_RATE,
        blocksize=8000,
        dtype='int16',
        channels=1,
        callback=audio_callback
    ):
        while True:
            data = q.get()
            if rec.AcceptWaveform(data):
                result = json.loads(rec.Result())
                text = result.get('text', '').strip()
                if text:
                    print(f"You said: {text}")
                    return text

# ============== GEMMA (LLM) ==============
import requests

def ask_gemma(prompt):
    """Send prompt to Gemma and get response"""
    try:
        resp = requests.post(OLLAMA_URL, json={
            "model": GEMMA_MODEL,
            "prompt": prompt,
            "system": SYSTEM_PROMPT,
            "stream": False
        }, timeout=30)
        data = resp.json()
        return data.get("response", "Sorry, kuch samajh nahi aaya.")
    except requests.ConnectionError:
        return "Ollama server nahi mil raha. Pehle ollama serve chalao."
    except Exception as e:
        return f"Error: {str(e)}"

# ============== PIPER (TTS) ==============
def speak(text):
    """Convert text to speech using Piper and play"""
    print(f"AI: {text}")
    try:
        wav_file = tempfile.mktemp(suffix=".wav")
        subprocess.run(
            ["piper", "--model", PIPER_MODEL, "--output_file", wav_file],
            input=text.encode("utf-8"),
            capture_output=True,
            timeout=15
        )
        if os.path.exists(wav_file) and os.path.getsize(wav_file) > 0:
            os.system(f"afplay {wav_file}")
            os.remove(wav_file)
        else:
            print("Piper: audio file nahi bana")
    except FileNotFoundError:
        print("Piper nahi mila. Install karo: pip3 install piper-tts")
    except Exception as e:
        print(f"TTS error: {e}")

# ============== MAIN LOOP ==============
def main():
    print("=" * 50)
    print("  BUSSAHAYAK AI VOICE ASSISTANT")
    print("  VOSK + Gemma + Piper")
    print("  100% Offline | Hindi Voice")
    print("=" * 50)
    print("\nSay 'hello' to start, 'bye' to exit\n")

    conversation = []

    while True:
        try:
            # Listen
            user_text = listen()

            if not user_text:
                continue

            # Check exit
            if any(w in user_text.lower() for w in ["bye", "exit", "quit", "band karo", "alvida"]):
                speak("Alvida! Safe travel ho! Main BusSahayak hoon, jab bhi zaroorat ho, bulao.")
                break

            # Build prompt with conversation history
            prompt = f"User said: {user_text}\n\nReply in short Hindi."
            if conversation:
                history = "\n".join(conversation[-4:])  # Last 4 exchanges
                prompt = f"Previous conversation:\n{history}\n\nUser said: {user_text}\n\nReply in short Hindi."

            # Get response from Gemma
            response = ask_gemma(prompt)

            # Store conversation
            conversation.append(f"User: {user_text}")
            conversation.append(f"AI: {response}")

            # Speak response
            speak(response)

        except KeyboardInterrupt:
            print("\n\nStopped. Bye!")
            break
        except Exception as e:
            print(f"Error: {e}")
            continue

if __name__ == "__main__":
    main()
