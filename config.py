# In backend/config.py

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration.

    This implementation defensively loads GEMINI_API_KEY_N entries from the
    environment and ignores any that are not present. It prints a brief
    diagnostic message when imported so startup logs show how many keys were
    found (helps debugging issues like the NameError you encountered).
    """

    # Attempt to read up to 5 keys from environment variables
    _keys = []
    for i in range(1, 6):
        k = os.getenv(f'GEMINI_API_KEY_{i}')
        if k:
            _keys.append(k)

    GEMINI_API_KEYS = _keys

    # Main configuration
    GEMINI_MODEL_NAME = os.getenv('GEMINI_MODEL_NAME', 'gemini-2.5-pro')
    PORT = int(os.getenv('PORT', 5000))
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')


# Print a short diagnostic so logs show what the config discovered.
print(f"Config loaded: PORT={Config.PORT}, FRONTEND_URL={Config.FRONTEND_URL}, GEMINI_API_KEYS={len(Config.GEMINI_API_KEYS)} key(s) found")
    