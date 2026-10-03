
import os

import subprocess

# FFmpeg DLL path

FFMPEG_BIN = r"C:\Users\Santhakumar S\Downloads\ffmpeg-9.0.2-full_build-shared\ffmpeg-9.0.2-full_build-shared\bin"

os.add_dll_directory(FFMPEG_BIN)

os.environ["PATH"] = FFMPEG_BIN + os.pathsep + os.environ["PATH"]

from fastapi import FastAPI, UploadFile, File

from faster_whisper import WhisperModel

from dotenv import load_dotenv

from pyannote.audio import Pipeline

load_dotenv()

HF_TOKEN = os.getenv("HUGGINGFACE_TOKEN")

# =========================

# PYANNOTE

# =========================

diarization_pipeline = Pipeline.from_pretrained(

    "pyannote/speaker-diarization-community-1",

    token=HF_TOKEN

)

# =========================

# FASTAPI

# =========================

app = FastAPI()

# =========================

# WHISPER

# =========================

model = WhisperModel(

    "base",

    device="cpu",

    compute_type="int8"

)


@app.get("/")

def home():

    return {

        "message": "AI-MEET AI service is running"

    }


@app.post("/audio")

async def receive_audio(file: UploadFile = File(...)):

    audio_data = await file.read()

    print("Audio received")

    print("Audio size:", len(audio_data), "bytes")

    # =========================

    # SAVE WEBM

    # =========================

    with open("temp_audio.webm", "wb") as audio_file:

        audio_file.write(audio_data)

    # =========================

    # CONVERT WEBM → WAV

    # =========================

    print("Converting WebM to WAV...")

    subprocess.run(

        [

            os.path.join(FFMPEG_BIN, "ffmpeg.exe"),

            "-y",

            "-i",

            "temp_audio.webm",

            "-ar",

            "16000",

            "-ac",

            "1",

            "temp_audio.wav"

        ],

        check=True,

        stdout=subprocess.DEVNULL,

        stderr=subprocess.DEVNULL

    )

    print("Audio converted to WAV")

    # =========================

    # SPEAKER DIARIZATION

    # =========================

    print("Running diarization...")

    output = diarization_pipeline("temp_audio.wav")

    speakers = []

    for turn, speaker in output.speaker_diarization:

        print(

            f"{speaker} speaks from "

            f"{turn.start:.2f}s to {turn.end:.2f}s"

        )

        speakers.append({

            "speaker": speaker,

            "start": turn.start,

            "end": turn.end

        })

    # =========================

    # WHISPER

    # =========================

    print("Running Whisper...")

    segments, info = model.transcribe("temp_audio.wav")

    transcript = ""

    whisper_segments = []

    for segment in segments:

        whisper_segments.append({

            "start": segment.start,

            "end": segment.end,

            "text": segment.text.strip()

        })

        transcript += segment.text

    print("Transcript:", transcript)

    print("Whisper segments:")

    for segment in whisper_segments:

        print(

            f"{segment['start']:.2f}s - "

            f"{segment['end']:.2f}s : "

            f"{segment['text']}"

        )

    # =========================

    # COMBINE SPEAKER + TEXT

    # =========================

    speaker_transcript = []

    for segment in whisper_segments:

        best_speaker = None

        best_overlap = 0

        for speaker in speakers:

            overlap_start = max(

                segment["start"],

                speaker["start"]

            )

            overlap_end = min(

                segment["end"],

                speaker["end"]

            )

            overlap = max(

                0,

                overlap_end - overlap_start

            )

            if overlap > best_overlap:

                best_overlap = overlap

                best_speaker = speaker["speaker"]

        speaker_transcript.append({

            "speaker": best_speaker,

            "start": segment["start"],

            "end": segment["end"],

            "text": segment["text"]

        })

    print("Speaker transcript:")

    for item in speaker_transcript:

        print(

            f"{item['speaker']}: "

            f"{item['text']}"

        )

    # =========================

    # RESPONSE

    # =========================

    return {

        "message": "Audio processed successfully",

        "transcript": transcript,

        "speakers": speakers,

        "whisper_segments": whisper_segments,

        "speaker_transcript": speaker_transcript

    }


@app.post("/diarize")

async def diarize_audio(file: UploadFile = File(...)):

    audio_data = await file.read()

    with open("test_audio.webm", "wb") as audio_file:

        audio_file.write(audio_data)

    # Convert to WAV

    subprocess.run(

        [

            os.path.join(FFMPEG_BIN, "ffmpeg.exe"),

            "-y",

            "-i",

            "test_audio.webm",

            "-ar",

            "16000",

            "-ac",

            "1",

            "test_audio.wav"

        ],

        check=True,

        stdout=subprocess.DEVNULL,

        stderr=subprocess.DEVNULL

    )

    output = diarization_pipeline("test_audio.wav")

    result = []

    for turn, speaker in output.speaker_diarization:

        result.append({

            "speaker": speaker,

            "start": turn.start,

            "end": turn.end

        })

    return {

        "speakers": result

    }

