import requests

# Replace 'your_access_token' with the actual token you received
access_token = 'BPqpTC5SHoRqSAIvHHU7EpILXjVk'

# Replace 'org_id' with the actual organization ID you want to retrieve details for
org_id = 'C894LttMQcGS3Kv6nSRPVQ'

# Endpoint URL
url = f"https://api.coursera.com/ent/api/businesses.v1/{org_id}/courseGradebookReports"

# Query parameters
params = {
    'q': 'search',
    'emailOrExternalId': 'bhuvaneshwari.k@kgcas.com',     # Optional
    'includeDeletedMembers': 'true',               # Optional
    'start': '0',                                  # Optional, default is 0
    'limit': '100'                                  # Optional, default is 50
}

# Headers
headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}

# Make the GET request
response = requests.get(url, headers=headers, params=params)

print(response.json())

# Check the response status code
if response.status_code == 200:
    print("Course gradebook reports retrieved successfully")
    course_gradebook_reports = response.json()
    print(course_gradebook_reports)
else:
    print("Failed to retrieve course gradebook reports")
    print(f"Status code: {response.status_code}")
    print(response.json())
