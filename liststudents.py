import os
import json
import google.auth
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# Scopes required for the Classroom API
SCOPES = [
    'https://www.googleapis.com/auth/classroom.courses',
    'https://www.googleapis.com/auth/classroom.coursework.students',
    'https://www.googleapis.com/auth/classroom.coursework.me',
    'https://www.googleapis.com/auth/classroom.rosters.readonly'
]

# Authentication and building the service
def authenticate():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('client_secret.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    return build('classroom', 'v1', credentials=creds)

# Get list of students in a course
def get_students(service, course_id):
    students = []
    page_token = None
    while True:
        response = service.courses().students().list(courseId=course_id, pageToken=page_token).execute()
        students.extend(response.get('students', []))
        page_token = response.get('nextPageToken')
        if not page_token:
            break
    return students

def main():
    service = authenticate()

    # Replace with your course ID
    course_id = '660191923617'

    students = get_students(service, course_id)
    for student in students:
        print(student)
        profile = student['profile']
        print(f"Student Name: {profile.get('name', {}).get('fullName', 'N/A')}, Email: {profile.get('emailAddress', 'N/A')}")

if __name__ == '__main__':
    main()
