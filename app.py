import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.ai_simplifier import AISimplifier
from config import Config
import traceback
import uuid
from utils.database import save_document_history, get_user_history
from utils.cloud_storage import upload_document_to_cloud

app = Flask(__name__)
# Configure CORS to allow requests specifically from your frontend URL
frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
CORS(app, resources={r"/api/*": {"origins": frontend_url}})

# Initialize our AI Simplifier one time when the app starts.
# This is much simpler and more reliable than lazy loading.
try:
    ai_simplifier = AISimplifier()
except Exception as e:
    print(f"FATAL: Could not initialize AISimplifier: {e}")
    ai_simplifier = None

@app.route('/')
def home():
    return jsonify({"message": "Legal Document Simplifier API", "status": "running"})

@app.route('/api/health', methods=['GET'])
def health_check():
    """A simple endpoint to check if the server and AI client are running."""
    is_ready = ai_simplifier is not None and ai_simplifier.available
    return jsonify({
        "status": "ok" if is_ready else "error",
        "message": "Service is running." if is_ready else "AI Simplifier is not available. Check server logs for errors.",
        "simplifier_ready": is_ready
    }), 200 if is_ready else 503

@app.route('/api/simplify', methods=['POST'])
def simplify_document_route():
    """
    The main endpoint to receive a document (either as a file or text)
    and return a high-quality simplification.
    """
    if not ai_simplifier or not ai_simplifier.available:
        return jsonify({"success": False, "error": "AI Simplifier is not available. Check server logs."}), 503 # Service Unavailable

    document_text = ""
    # Handle file uploads from your frontend's FormData
    if 'file' in request.files:
        file = request.files['file']
        if file.filename == '':
            return jsonify({"success": False, "error": "No file selected"}), 400
        try:
            # Read file contents and decode as UTF-8 text
            document_text = file.read().decode('utf-8')
        except Exception as e:
            return jsonify({"success": False, "error": f"Error reading file: {e}"}), 400
    # Handle raw text sent in a JSON body
    elif request.is_json:
        data = request.get_json()
        document_text = data.get('text', '')
    else:
        return jsonify({"success": False, "error": "Invalid request. Please provide a file or a JSON body with a 'text' field."}), 400

    if not document_text.strip():
        return jsonify({"success": False, "error": "Document text is empty."}), 400

    try:
        # --- THE NEW, CORRECT PIPELINE ---
        # Pass the entire document text directly to the powerful AISimplifier.
        simplified_text = ai_simplifier.simplify_text(document_text)
        
        return jsonify({"success": True, "simplified_text": simplified_text})

    except Exception as e:
        print(f"--- UNEXPECTED ERROR IN SIMPLIFICATION ---")
        traceback.print_exc() # Print detailed error to server log
        return jsonify({"success": False, "error": "An unexpected error occurred on the server during simplification."}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=Config.PORT, debug=True)
# In backend/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.ai_simplifier import AISimplifier
from config import Config
import traceback

app = Flask(__name__)
# Configure CORS to allow requests specifically from your frontend URL
CORS(app, resources={r"/api/*": {"origins": Config.FRONTEND_URL}})

# Initialize our AI Simplifier one time when the app starts.
# This is much simpler and more reliable than lazy loading.
try:
    ai_simplifier = AISimplifier()
except Exception as e:
    print(f"FATAL: Could not initialize AISimplifier. The app will not work. Error: {e}")
    ai_simplifier = None

@app.route('/api/health', methods=['GET'])
def health_check():
    """A simple endpoint to check if the server and AI client are running."""
    is_ready = ai_simplifier is not None and ai_simplifier.available
    return jsonify({
        "status": "ok" if is_ready else "error",
        "message": "Service is running." if is_ready else "AI Simplifier is not available. Check server logs for errors.",
        "simplifier_ready": is_ready
    }), 200 if is_ready else 503

@app.route('/api/simplify', methods=['POST'])
def simplify_document_route():
    """
    The main endpoint to receive a document (either as a file or text)
    and return a high-quality simplification.
    """
    if not ai_simplifier or not ai_simplifier.available:
        return jsonify({"success": False, "error": "AI Simplifier is not available. Check server logs."}), 503 # Service Unavailable

    document_text = ""
    # Handle file uploads from your frontend's FormData
    if 'file' in request.files:
        file = request.files['file']
        if file.filename == '':
            return jsonify({"success": False, "error": "No file selected"}), 400
        try:
            # Read file contents and decode as UTF-8 text
            document_text = file.read().decode('utf-8')
        except Exception as e:
            return jsonify({"success": False, "error": f"Error reading file: {e}"}), 400
    # Handle raw text sent in a JSON body
    elif request.is_json:
        data = request.get_json()
        document_text = data.get('text', '')
    else:
        return jsonify({"success": False, "error": "Invalid request. Please provide a file or a JSON body with a 'text' field."}), 400

    if not document_text.strip():
        return jsonify({"success": False, "error": "Document text is empty."}), 400

    try:
        # --- THE NEW, CORRECT PIPELINE ---
        # Pass the entire document text directly to the powerful AISimplifier.
        simplified_text = ai_simplifier.simplify_text(document_text)
        
        return jsonify({"success": True, "simplified_text": simplified_text})

    except Exception as e:
        print(f"--- UNEXPECTED ERROR IN SIMPLIFICATION ---")
        traceback.print_exc() # Print detailed error to server log
        return jsonify({"success": False, "error": "An unexpected error occurred on the server during simplification."}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
