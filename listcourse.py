import os
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
    'https://www.googleapis.com/auth/classroom.courses',  # See, edit, create, and permanently delete your Google Classroom classes
]

def authenticate():
    creds = None
    # Delete existing token.json to ensure we get a fresh token with the correct scopes
    if os.path.exists('token.json'):
        os.remove('token.json')
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('client_secret.json', SCOPES)
            logger.info("Opening browser for authentication...")
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    return build('classroom', 'v1', credentials=creds)

def list_courses(service):
    try:
        results = service.courses().list(pageSize=10).execute()
        courses = results.get('courses', [])

        if not courses:
            print('No courses found.')
        else:
            print('Courses:')
            for course in courses:
                print(f"Name: {course['name']}, ID: {course['id']}")
    except Exception as e:
        logger.error(f"Failed to list courses: {e}")

def main():
    try:
        service = authenticate()
        list_courses(service)
    except Exception as e:
        logger.error(f"An error occurred: {e}")

if __name__ == '__main__':
    main()
