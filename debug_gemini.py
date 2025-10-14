import os
import sys
import json
import time

print(f"--- Running Gemini Debug Script ({time.asctime()}) ---")

# --- 1. Check Library Import ---
try:
    import google.generativeai as genai
    print(f"✓ Successfully imported google.generativeai (version: {getattr(genai, '__version__', 'unknown')})")
except Exception as e:
    print(f"✗ FATAL: Failed to import google.generativeai. Is it installed? (pip install google-generativeai)")
    print(f"  Error: {repr(e)}")
    sys.exit(1)

# --- 2. Load Configuration ---
Config = None
try:
    # Assuming this script is run from the 'backend' directory
    from config import Config
    print("✓ Successfully loaded Config from config.py")
except Exception as e:
    print(f"✗ FATAL: Could not load Config from config.py. Make sure this script is in the 'backend' folder.")
    print(f"  Error: {repr(e)}")
    sys.exit(1)

# --- 3. Check and Configure API Key ---
try:
    # Use the list of keys from our final configuration
    api_keys = getattr(Config, 'GEMINI_API_KEYS', [])
    if not api_keys:
        raise ValueError("Config.GEMINI_API_KEYS list is empty. Check your .env and config.py files.")
    
    # Configure with the first key for this test
    genai.configure(api_key=api_keys[0])
    print(f"✓ Configured genai with the first of {len(api_keys)} API key(s) found in Config.")

except Exception as e:
    print(f"✗ FATAL: Could not configure API key.")
    print(f"  Error: {repr(e)}")
    sys.exit(1)

# --- 4. Test API Connection (Authentication) ---
print("\n--- Testing API Connection by Listing Models ---")
try:
    # list_models() is the best way to check if the API key is valid
    model_list = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
    print(f"✓ Successfully connected to the API. Found {len(model_list)} usable models.")
    print("   Sample models:", model_list[:5])
except Exception as e:
    print(f"✗ FAILED to connect to the Gemini API. This is likely an invalid API key or a network issue.")
    print(f"  Error: {repr(e)}")
    sys.exit(1)

# --- 5. Test Model Instantiation ---
model_name_to_test = getattr(Config, 'GEMINI_MODEL_NAME', 'gemini-2.5-pro')
print(f"\n--- Testing Model Instantiation with '{model_name_to_test}' ---")
try:
    model = genai.GenerativeModel(model_name_to_test)
    print(f"✓ Successfully created a GenerativeModel instance for '{model_name_to_test}'.")
    # print("   Model methods:", [m for m in dir(model) if not m.startswith('_') and 'generate' in m]) # Optional: uncomment to see methods
except Exception as e:
    print(f"✗ FAILED to instantiate the model. The model name '{model_name_to_test}' may be incorrect or not available for your API key.")
    print(f"  Error: {repr(e)}")
    sys.exit(1)

print("\n✅ All checks passed. Your Gemini API configuration is working correctly.")
print("--- Debug script finished ---")