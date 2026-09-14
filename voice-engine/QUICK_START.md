# Quick Start — 28 Recordings

## Your Dataset

You have 28 WAV files. This is enough to start training a basic voice clone.
For better quality, record more later (aim for 100-300).

## Step 1: Organize Your Files

Put your 28 WAV files in this exact folder:

```
voice-engine/my_voice_dataset/wavs/
├── line_001.wav
├── line_002.wav
├── ...
└── line_028.wav
```

## Step 2: Update metadata.csv

Open `voice-engine/my_voice_dataset/metadata.csv` and keep only 28 lines.
Each line must match your WAV filename and the spoken text:

```
line_001|Welcome to Bus Sahayak.
line_002|Hold the screen to activate voice.
line_003|Double tap to select.
... (28 lines total)
```

## Step 3: Zip and Upload

```bash
cd /Users/nitindoyal.design/Documents/Codex/2026-05-08/bus-sahayak/voice-engine
zip -r my_voice_dataset.zip my_voice_dataset/
```

## Step 4: Open Google Colab

1. Go to https://colab.research.google.com
2. Click **New Notebook**
3. Runtime → Change runtime type → **GPU (T4)**
4. Copy the cells below

## Step 5: Run Training

Copy each cell into Colab and run:

### Cell 1 — Install
```python
!pip install TTS
```

### Cell 2 — Upload Dataset
```python
from google.colab import files
import zipfile, os

uploaded = files.upload()
for f in uploaded:
    if f.endswith('.zip'):
        with zipfile.ZipFile(f, 'r') as z:
            z.extractall('.')
        print(f"Extracted: {f}")

!find my_voice_dataset -type f | head -10
print(f"WAV files: {len([f for f in os.listdir('my_voice_dataset/wavs') if f.endswith('.wav')])}")
```

### Cell 3 — Train (optimized for 28 samples)
```python
import os
from TTS.tts.configs.shared_configs import BaseDatasetConfig
from TTS.tts.configs.vits_config import VitsConfig
from TTS.tts.datasets import load_tts_samples
from TTS.tts.models.vits import Vits
from TTS.trainer import Trainer

dataset_config = BaseDatasetConfig(
    formatter="ljspeech",
    dataset_name="my_voice",
    path=os.path.abspath("./my_voice_dataset/")
)

config = VitsConfig(
    audio=None,
    run_name="bus_sahayak_voice",
    batch_size=4,        # Small batch for 28 samples
    eval_batch_size=2,
    num_loader_workers=2,
    run_eval=True,
    test_delay_epochs=-1,
    epochs=300,          # 300 epochs is enough for 28 samples
    text_cleaner="english_cleaners",
    use_phonemes=True,
    phoneme_language="en",
    datasets=[dataset_config],
)

ap = Vits.init_audio_processor(config)
tokenizer, config = Vits.init_tokenizer(config)
train_samples, eval_samples = load_tts_samples(dataset_config, eval_split=True)
model = Vits(config, ap, tokenizer, speaker_manager=None)

trainer = Trainer(
    config,
    output_path="./output_models/",
    model=model,
    train_samples=train_samples,
    eval_samples=eval_samples,
)
trainer.fit()
```

### Cell 4 — Test
```python
from TTS.utils.synthesizer import Synthesizer
import glob

dirs = sorted(glob.glob("./output_models/bus_sahayak_voice-*"))
latest = dirs[-1]

syn = Synthesizer(
    tts_checkpoint=f"{latest}/best_model.pth",
    tts_config_path=f"{latest}/config.json",
    use_cuda=True
)

wav = syn.tts("Welcome to Bus Sahayak. Say a number to select a bus.")
syn.save_wav(wav, "test.wav")

from IPython.display import Audio
Audio("test.wav")
```

### Cell 5 — Download
```python
from google.colab import files
files.download(f"{latest}/best_model.pth")
files.download(f"{latest}/config.json")
```

## Training Time

| Epochs | Time (T4 GPU) |
|--------|---------------|
| 100    | ~25 min       |
| 200    | ~50 min       |
| 300    | ~75 min       |

## Tips

- **Listen at 100 epochs** — if it sounds decent, stop training
- **28 samples = basic clone** — record more for better quality
- **Batch size 4** — works with small datasets
- **300 epochs max** — more won't help with only 28 samples
- **Checkpoints save every 10 epochs** — listen to eval clips
