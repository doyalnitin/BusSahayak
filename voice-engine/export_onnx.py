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

print(f"Exporting model from: {latest_dir}")
print(f"Model: {model_path}")
print(f"Config: {config_path}")


# Export to ONNX format for mobile deployment
os.system(
    f"python -m TTS.utils.export_onnx "
    f"--checkpoint_path {model_path} "
    f"--config_path {config_path} "
    f"--output_path ./bus_sahayak_voice.onnx"
)


# Verify the export
if os.path.exists("./bus_sahayak_voice.onnx"):
    size_mb = os.path.getsize("./bus_sahayak_voice.onnx") / (1024 * 1024)
    print(f"\nExport successful!")
    print(f"File: ./bus_sahayak_voice.onnx")
    print(f"Size: {size_mb:.1f} MB")
    print(f"\nNext steps:")
    print(f"1. Copy bus_sahayak_voice.onnx to your React Native project")
    print(f"2. Use expo-av or react-native-tts for playback")
    print(f"3. The ONNX model runs offline on device CPU")
else:
    print("\nExport failed. Check errors above.")
