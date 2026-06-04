import os
import tempfile

from pydub import AudioSegment
from django.conf import settings


def analyze_audio_volume(audio_file):
    """
    Analyze uploaded audio file for volume level.
    Returns dict with volume_db, duration, and is_valid.
    """
    suffix = os.path.splitext(audio_file.name)[1] or '.wav'
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        for chunk in audio_file.chunks():
            tmp.write(chunk)
        tmp_path = tmp.name

    try:
        audio = AudioSegment.from_file(tmp_path)
        avg_dbfs = audio.dBFS
        duration_seconds = len(audio) / 1000.0
        threshold = getattr(settings, 'VOLUME_THRESHOLD_DB', -40.0)
        is_valid = avg_dbfs >= threshold
        return {
            'volume_db': round(avg_dbfs, 2),
            'duration': round(duration_seconds, 2),
            'is_valid': is_valid,
        }
    finally:
        os.unlink(tmp_path)
