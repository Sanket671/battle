import cloudinary
import cloudinary.uploader
import cloudinary.api
import os

def configure_cloudinary():
    cloudinary.config(
        cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
        api_key=os.getenv('CLOUDINARY_API_KEY'),
        api_secret=os.getenv('CLOUDINARY_API_SECRET')
    )

def upload_document_to_cloud(file_content, filename, user_session):
    try:
        configure_cloudinary()
        
        # Upload to cloudinary
        result = cloudinary.uploader.upload(
            file_content,
            folder=f"legal_documents/{user_session}",
            public_id=f"{filename}_{datetime.now().timestamp()}",
            resource_type="raw"  # For text files
        )
        
        return result['secure_url']
    except Exception as e:
        print(f"Cloudinary upload failed: {e}")
        return None