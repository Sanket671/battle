import os
from pymongo import MongoClient
from datetime import datetime
import cloudinary
import cloudinary.uploader
import cloudinary.api

# MongoDB setup
def get_mongodb_client():
    mongodb_uri = os.getenv('MONGODB_URI')
    if not mongodb_uri:
        print("⚠️ MONGODB_URI not set, using local storage")
        return None
    
    try:
        client = MongoClient(mongodb_uri)
        # Test connection
        client.admin.command('ping')
        print("✓ Connected to MongoDB Atlas")
        return client
    except Exception as e:
        print(f"⚠️ MongoDB connection failed: {e}")
        return None

def save_document_history(user_session, original_text, simplified_text, filename=None):
    client = get_mongodb_client()
    if not client:
        return None
    
    try:
        db = client.legal_documents
        history_entry = {
            'user_session': user_session,
            'original_text': original_text[:500],  # Store first 500 chars
            'simplified_text': simplified_text[:500],
            'filename': filename,
            'timestamp': datetime.utcnow(),
            'status': 'completed'
        }
        result = db.history.insert_one(history_entry)
        return str(result.inserted_id)
    except Exception as e:
        print(f"Error saving to database: {e}")
        return None

def get_user_history(user_session, limit=10):
    client = get_mongodb_client()
    if not client:
        return []
    
    try:
        db = client.legal_documents
        history = list(db.history.find(
            {'user_session': user_session}
        ).sort('timestamp', -1).limit(limit))
        
        # Convert ObjectId to string for JSON serialization
        for item in history:
            item['_id'] = str(item['_id'])
            item['timestamp'] = item['timestamp'].isoformat()
        
        return history
    except Exception as e:
        print(f"Error fetching history: {e}")
        return []