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
    'https://www.googleapis.com/auth/classroom.courses.readonly',  # View your Google Classroom classes
    'https://www.googleapis.com/auth/classroom.coursework.students',  # Manage course work and grades for students in the Google Classroom classes you teach and view the course work and grades for classes you administer
    'https://www.googleapis.com/auth/classroom.courseworkmaterials',  # See, edit, and create classwork materials in Google Classroom
    'https://www.googleapis.com/auth/classroom.topics',  # See, create, and edit topics in Google Classroom
    'https://www.googleapis.com/auth/classroom.announcements',  # View and manage announcements in Google Classroom
    'https://www.googleapis.com/auth/classroom.coursework.readonly',  # View instructions for teacher-assigned work in your Google Classroom classes
    'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',  # View course work and grades for students in the Google Classroom classes you teach or administer
    'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',  # View your course work and grades in Google Classroom
    'https://www.googleapis.com/auth/classroom.coursework.me',  # See, create and edit coursework items including assignments, questions, and grades
    'https://www.googleapis.com/auth/classroom.announcements.readonly',  # View announcements in Google Classroom
    'https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly',  # See all classwork materials for your Google Classroom classes
    'https://www.googleapis.com/auth/classroom.topics.readonly',  # View topics in Google Classroom
    'https://www.googleapis.com/auth/classroom.addons.student',  # See and update its own attachments to posts in Google Classroom
    'https://www.googleapis.com/auth/classroom.addons.teacher',  # See, create, and update its own attachments to posts in classes you teach in Google Classroom
    'https://www.googleapis.com/auth/classroom.guardianlinks.students.readonly',  # View guardians for students in your Google Classroom classes
    'https://www.googleapis.com/auth/classroom.guardianlinks.students',  # View and manage guardians for students in your Google Classroom classes
    'https://www.googleapis.com/auth/classroom.rosters',  # Manage your Google Classroom class rosters
    'https://www.googleapis.com/auth/classroom.rosters.readonly',  # View your Google Classroom class rosters
    'https://www.googleapis.com/auth/classroom.profile.emails',  # View the email addresses of people in your classes
    'https://www.googleapis.com/auth/classroom.profile.photos',  # View the profile photos of people in your classes
    'https://www.googleapis.com/auth/classroom.guardianlinks.me.readonly',  # View your Google Classroom guardians
    'https://www.googleapis.com/auth/classroom.push-notifications'  # Receive notifications about your Google Classroom data
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
