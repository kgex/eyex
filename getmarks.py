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
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly'
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

def list_courses(service):
    results = service.courses().list(pageSize=10).execute()
    courses = results.get('courses', [])
    if not courses:
        logger.info('No courses found.')
        return []
    logger.info('Courses:')
    for course in courses:
        logger.info(f"Name: {course['name']}, ID: {course['id']}")
    return courses

def list_coursework(service, course_id):
    results = service.courses().courseWork().list(courseId=course_id).execute()
    coursework = results.get('courseWork', [])
    if not coursework:
        logger.info('No coursework found.')
        return []
    logger.info('Coursework:')
    for work in coursework:
        logger.info(f"Title: {work['title']}, ID: {work['id']}")
    return coursework

def list_student_submissions(service, course_id, coursework_id):
    results = service.courses().courseWork().studentSubmissions().list(courseId=course_id, courseWorkId=coursework_id).execute()
    submissions = results.get('studentSubmissions', [])
    if not submissions:
        logger.info('No submissions found.')
        return []
    logger.info('Submissions:')
    for submission in submissions:
        student_id = submission['userId']
        assigned_grade = submission.get('assignedGrade', 'Not graded')
        logger.info(f"Student ID: {student_id}, Assigned Grade: {assigned_grade}")
    return submissions

def main():
    try:
        service = authenticate()

        # Example: Use the first course and its first coursework
        course_id = '660191923617' #courses[0]['id']
        coursework = list_coursework(service, course_id)
        if not coursework:
            return

        coursework_id = coursework[0]['id']
        list_student_submissions(service, course_id, coursework_id)

    except Exception as e:
        logger.error(f"An error occurred: {e}")

if __name__ == '__main__':
    main()
