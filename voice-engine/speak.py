from TTS.utils.synthesizer import Synthesizer
import os
import glob


# Auto-find the latest checkpoint
output_dirs = sorted(glob.glob("./output_models/vits_bus_sahayak_voice-*"))
if not output_dirs:
    print("No trained model found. Run train.py first.")
    exit(1)

latest_dir = output_dirs[-1]
model_path = os.path.join(latest_dir, "best_model.pth")
config_path = os.path.join(latest_dir, "config.json")

print(f"Loading model from: {latest_dir}")


# Load the custom engine
syn = Synthesizer(
    tts_checkpoint=model_path,
    tts_config_path=config_path,
    use_cuda=False  # Set True if you have NVIDIA GPU
)


# Test phrases for the bus booking voice engine
test_phrases = [
    "Welcome to Bus Sahayak, your voice-first bus booking assistant.",
    "Found five buses from Mumbai to Pune.",
    "Bus one. VRL Travels. AC Sleeper. Departs at ten PM.",
    "Say a number between one and five to select a bus.",
    "Booking submitted successfully. A manager will call you shortly.",
    "Your PNR number is Z P bus nine eight seven six five four three.",
    "Hold the screen to activate voice commands.",
    "Double tap to select. Triple tap to go home.",
    "Sorry, I did not understand that. Please try again.",
    "Have a safe and comfortable journey.",
]


# Generate speech for each test phrase
os.makedirs("./test_outputs", exist_ok=True)

for i, phrase in enumerate(test_phrases, 1):
    print(f"Synthesizing {i}/{len(test_phrases)}: {phrase[:50]}...")
    wav = syn.tts(phrase)
    output_file = f"./test_outputs/test_{i:03d}.wav"
    syn.save_wav(wav, output_file)
    print(f"  Saved: {output_file}")

print(f"\nDone! {len(test_phrases)} audio files saved to ./test_outputs/")
