import requests

# Replace 'your_access_token' with the actual token you received
access_token = 'BPqpTC5SHoRqSAIvHHU7EpILXjVk'

# Replace 'your_org_id' with the actual organization ID you want to retrieve details for
org_id = 'C894LttMQcGS3Kv6nSRPVQ'

# Endpoint URL
url = f"https://api.coursera.com/ent/api/businesses.v1/{org_id}/programs"

# Headers
headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}

# Make the GET request
response = requests.get(url, headers=headers)

# Check the response status code
if response.status_code == 200:
    print("Organization details retrieved successfully")
    organization_details = response.json()
    print(organization_details)
else:
    print("Failed to retrieve organization details")
    print(f"Status code: {response.status_code}")
    print(response.json())


