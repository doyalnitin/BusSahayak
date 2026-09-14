import os
from TTS.tts.configs.shared_configs import BaseDatasetConfig
from TTS.tts.configs.vits_config import VitsConfig
from TTS.tts.datasets import load_tts_samples
from TTS.tts.models.vits import Vits
from TTS.trainer import Trainer


# 1. Point the system to your custom dataset directory
dataset_config = BaseDatasetConfig(
    formatter="ljspeech",
    dataset_name="my_custom_voice",
    path=os.path.abspath("./my_voice_dataset/")
)


# 2. Configure the VITS Neural Network Parameters
config = VitsConfig(
    audio=None,
    run_name="vits_bus_sahayak_voice",
    batch_size=16,
    eval_batch_size=4,
    num_loader_workers=4,
    num_eval_loader_workers=4,
    run_eval=True,
    test_delay_epochs=-1,
    epochs=1000,
    text_cleaner="english_cleaners",
    use_phonemes=True,
    phoneme_language="en",
    datasets=[dataset_config],
)


# 3. Initialize the model and data loader
ap = Vits.init_audio_processor(config)
tokenizer, config = Vits.init_tokenizer(config)
train_samples, eval_samples = load_tts_samples(dataset_config, eval_split=True)


model = Vits(config, ap, tokenizer, speaker_manager=None)


# 4. Start the AI trainer loop
trainer = Trainer(
    config,
    output_path="./output_models/",
    model=model,
    train_samples=train_samples,
    eval_samples=eval_samples,
)
trainer.fit()
