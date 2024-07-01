import os
import json
import google.auth
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import logging

# Enable logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Scopes required for the Classroom API
SCOPES = [
    'https://www.googleapis.com/auth/classroom.courses',
    'https://www.googleapis.com/auth/classroom.coursework.students',
    'https://www.googleapis.com/auth/classroom.coursework.me',
    'https://www.googleapis.com/auth/classroom.rosters.readonly'
]

def authenticate():
    creds = None
    token_path = 'token.json'
    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('client_secret.json', SCOPES)
            logger.info("Opening browser for authentication...")
            creds = flow.run_local_server(port=0)
        with open(token_path, 'w') as token:
            token.write(creds.to_json())
    return build('classroom', 'v1', credentials=creds)

def list_coursework(service, course_id):
    try:
        results = service.courses().courseWork().list(courseId=course_id).execute()
        coursework = results.get('courseWork', [])
        if not coursework:
            logger.info('No coursework found.')
            return []
        logger.info('Coursework:')
        for work in coursework:
            logger.info(f"Title: {work['title']}, ID: {work['id']}, Due Date: {work.get('dueDate')}, Max Points: {work.get('maxPoints')}")
        return coursework
    except Exception as e:
        logger.error(f"Failed to list coursework: {e}")
        return []

def main():
    try:
        service = authenticate()
        
        # Define your course_id
        course_id = '660191923617'

        # List coursework for the specified course
        list_coursework(service, course_id)

    except Exception as e:
        logger.error(f"An error occurred: {e}")

if __name__ == '__main__':
    main()
