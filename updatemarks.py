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
    'https://www.googleapis.com/auth/classroom.coursework.me'
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

def update_marks(service, course_id, coursework_id, marks_data):
    for student_id, mark in marks_data.items():
        try:
            # Get the student submission ID
            submissions = service.courses().courseWork().studentSubmissions().list(
                courseId=course_id,
                courseWorkId=coursework_id,
                userId=student_id
            ).execute()
            if 'studentSubmissions' in submissions:
                submission = submissions['studentSubmissions'][0]
                # print(submissions)
                submission_id = submission['id']
                
                # Check if the submission is associated with the developer project
                if submission.get('associatedWithDeveloper', False):
                    body = {
                        'assignedGrade': mark
                    }
                    service.courses().courseWork().studentSubmissions().patch(
                        courseId=course_id,
                        courseWorkId=coursework_id,
                        id=submission_id,
                        updateMask='assignedGrade',
                        body=body
                    ).execute()
                    service.courses().courseWork().studentSubmissions().return_(
                        courseId=course_id,
                        courseWorkId=coursework_id,
                        id=submission_id,
                        body={}
                    ).execute()
                    logger.info(f"Updated grade for student {student_id} to {mark}")
                else:
                    logger.warning(f"Cannot modify submission for student {student_id} as it is not associated with the developer project.")
            else:
                logger.warning(f"No submission found for student {student_id}")
        except Exception as e:
            logger.error(f"Failed to update grade for student {student_id}: {e}")

def main():
    try:
        service = authenticate()
        
        # Define your course_id and coursework_id
        course_id = '660191923617'
        coursework_id = '696932011501'

        # Load marks data from JSON file
        with open('students_marks.json', 'r') as file:
            marks_data = json.load(file)

        # Update marks for all students
        update_marks(service, course_id, coursework_id, marks_data)

    except Exception as e:
        logger.error(f"An error occurred: {e}")

if __name__ == '__main__':
    main()
