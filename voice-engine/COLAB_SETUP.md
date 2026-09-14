# BusSahayak Voice Engine — Google Colab Setup

## Quick Start (Free GPU)

1. Go to https://colab.research.google.com
2. Click "New Notebook"
3. Runtime → Change runtime type → GPU
4. Run each cell below

---

## Cell 1: Install Dependencies

```python
!pip install TTS
!pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu118
```

## Cell 2: Upload Your Dataset

```python
from google.colab import files
import zipfile
import os

# Zip your my_voice_dataset/ folder first, then upload
uploaded = files.upload()

# Extract
for filename in uploaded.keys():
    if filename.endswith('.zip'):
        with zipfile.ZipFile(filename, 'r') as zip_ref:
            zip_ref.extractall('.')
        print(f"Extracted: {filename}")

# Verify
print("\nDataset structure:")
!find my_voice_dataset -type f | head -20
print(f"\nTotal WAV files: {len([f for f in os.listdir('my_voice_dataset/wavs') if f.endswith('.wav')])}")
```

## Cell 3: Train the Model

```python
import os
from TTS.tts.configs.shared_configs import BaseDatasetConfig
from TTS.tts.configs.vits_config import VitsConfig
from TTS.tts.datasets import load_tts_samples
from TTS.tts.models.vits import Vits
from TTS.trainer import Trainer

# Point to dataset
dataset_config = BaseDatasetConfig(
    formatter="ljspeech",
    dataset_name="my_custom_voice",
    path=os.path.abspath("./my_voice_dataset/")
)

# Configure VITS
config = VitsConfig(
    audio=None,
    run_name="vits_bus_sahayak",
    batch_size=16,
    eval_batch_size=4,
    num_loader_workers=4,
    run_eval=True,
    test_delay_epochs=-1,
    epochs=500,  # Colab free tier: 500 epochs is realistic
    text_cleaner="english_cleaners",
    use_phonemes=True,
    phoneme_language="en",
    datasets=[dataset_config],
)

# Initialize
ap = Vits.init_audio_processor(config)
tokenizer, config = Vits.init_tokenizer(config)
train_samples, eval_samples = load_tts_samples(dataset_config, eval_split=True)
model = Vits(config, ap, tokenizer, speaker_manager=None)

# Train
trainer = Trainer(
    config,
    output_path="./output_models/",
    model=model,
    train_samples=train_samples,
    eval_samples=eval_samples,
)
trainer.fit()
```

## Cell 4: Test the Model

```python
from TTS.utils.synthesizer import Synthesizer
import glob

# Find latest checkpoint
output_dirs = sorted(glob.glob("./output_models/vits_bus_sahayak-*"))
latest_dir = output_dirs[-1]

syn = Synthesizer(
    tts_checkpoint=f"{latest_dir}/best_model.pth",
    tts_config_path=f"{latest_dir}/config.json",
    use_cuda=True
)

# Test
test = "Welcome to Bus Sahayak. Say a number to select a bus."
wav = syn.tts(test)
syn.save_wav(wav, "test_output.wav")

# Play in Colab
from IPython.display import Audio
Audio("test_output.wav")
```

## Cell 5: Export to ONNX

```python
!python -m TTS.utils.export_onnx \
    --checkpoint_path {latest_dir}/best_model.pth \
    --config_path {latest_dir}/config.json \
    --output_path ./bus_sahayak_voice.onnx

# Download the ONNX file
files.download("./bus_sahayak_voice.onnx")
```

---

## Training Time Estimates

| GPU | Epochs | Time |
|-----|--------|------|
| T4 (free) | 500 | ~2 hours |
| T4 (free) | 1000 | ~4 hours |
| V100 (pro) | 500 | ~45 min |
| A100 (pro) | 1000 | ~30 min |

## Tips

- **Stop early** if the audio sounds good at 200-300 epochs
- **Listen to eval samples** in output_models/ to check quality
- **Batch size 16** works on T4 (16GB VRAM)
- **Lower to 8** if you get CUDA out of memory
- **Save checkpoints** are in output_models/ every 10 epochs
