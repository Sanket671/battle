# In backend/utils/ai_simplifier.py

import os
import re
import time
import google.generativeai as genai
from google.api_core import exceptions

try:
    from config import Config
except ImportError:
    try:
        from ..config import Config
    except ImportError:
        from backend.config import Config

class AISimplifier:
    """
    A class to simplify legal documents using the Gemini API, with robust
    error handling, fallbacks, and automatic API key rotation.
    """
    def __init__(self):
        """Initializes the AISimplifier, loading a pool of API keys."""
        self.available = False
        self.model = None
        
        try:
            self.api_keys = getattr(Config, 'GEMINI_API_KEYS', [])
            self.model_name = getattr(Config, 'GEMINI_MODEL_NAME', 'gemini-2.5-pro')

            if not self.api_keys:
                raise ValueError("GEMINI_API_KEYS list is empty in config.py. Please check .env file.")

            self.current_key_index = 0
            self._configure_client_with_current_key()
            
            self.available = True
            print(f"✓ Gemini AI simplifier initialized with {len(self.api_keys)} API key(s). Using model: {self.model_name}")

        except Exception as e:
            print(f"⚠️ Gemini initialization failed: {e}")
            self.available = False

    def _configure_client_with_current_key(self):
        """Helper function to configure genai and instantiate the model with the current key."""
        current_key = self.api_keys[self.current_key_index]
        print(f"--> Configuring Gemini with API Key #{self.current_key_index + 1}")
        genai.configure(api_key=current_key)
        self.model = genai.GenerativeModel(self.model_name)

    def _switch_to_next_key(self) -> bool:
        """Switches to the next API key. Returns True if successful, False if all keys are exhausted."""
        print(f"⚠️ API Key #{self.current_key_index + 1} is rate-limited.")
        self.current_key_index += 1
        if self.current_key_index < len(self.api_keys):
            self._configure_client_with_current_key()
            return True
        else:
            print("🔴 All API keys have been exhausted.")
            return False

    def simplify_text(self, text: str) -> str:
        """Simplifies a full legal document, automatically rotating API keys on quota errors."""
        if not self.available:
            return self._fallback_simplify(text, reason="Gemini model not available")

        clean_text = (text or "").strip()
        if not clean_text: return ""

        if len(clean_text) > 30000:
            clean_text = clean_text[:15000] + "\n\n...[DOCUMENT TRUNCATED]...\n\n" + clean_text[-15000:]

        # This advanced prompt with an example is the key to high-quality results.
        prompt = f"""
        You are an expert legal analyst... (Full few-shot prompt from previous answer) ...
        LEGAL DOCUMENT:
        ---
        {clean_text}
        ---
        SIMPLIFIED SUMMARY:
        """

        for _ in range(len(self.api_keys) - self.current_key_index):
            try:
                generation_config = {"temperature": 0.1, "max_output_tokens": 4096}
                safety_settings = [{"category": c, "threshold": "BLOCK_NONE"} for c in ["HARM_CATEGORY_HARASSMENT", "HARM_CATEGORY_HATE_SPEECH", "HARM_CATEGORY_SEXUALLY_EXPLICIT", "HARM_CATEGORY_DANGEROUS_CONTENT"]]

                response = self.model.generate_content(
                    prompt,
                    generation_config=generation_config,
                    safety_settings=safety_settings
                )
                
                if not response.parts:
                    finish_reason = response.candidates[0].finish_reason.name if response.candidates else "UNKNOWN"
                    raise ValueError(f"Blocked response. Finish Reason: {finish_reason}")
                
                model_text = (response.text or "").strip()
                if model_text:
                    return model_text
                else:
                    raise ValueError("Gemini returned an empty string.")

            except exceptions.ResourceExhausted as e:
                if not self._switch_to_next_key():
                    self._log_error(e)
                    return self._fallback_simplify(text, reason="All API keys are rate-limited.")
            
            except Exception as e:
                print(f"⚠️ An unrecoverable Gemini API error occurred, using fallback. Reason: {e}")
                self._log_error(e)
                return self._fallback_simplify(text, reason=str(e))
        
        return self._fallback_simplify(text, reason="All available API keys failed due to rate limits.")

    def _log_error(self, error: Exception):
        # ... (same as before)
        pass

    def _fallback_simplify(self, text: str, reason: str = "Unknown") -> str:
        # ... (same as before)
        pass

if __name__ == '__main__':
    # ... (same as before)
    pass