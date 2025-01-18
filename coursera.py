import requests
import base64

# Replace 'your_app_key' and 'your_app_secret' with your actual app key and secret
app_key = '6GnrBII8eTTnMRDNGBDe3jlmrXBI5ATXUxHRhj9KhIr0nBwg'
app_secret = 'rPfBMbD49jpVvD1OJDbNG5rsAxh9J4AcHvhBaWDUmdDwNrGpzkY7SgL2QGMrONYl'

# Encode the key and secret
auth_string = f"{app_key}:{app_secret}"
base64_auth_string = base64.b64encode(auth_string.encode()).decode()

url = "https://api.coursera.com/oauth2/client_credentials/token"
headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "Authorization": f"Basic {base64_auth_string}"
}
data = {
    "grant_type": "client_credentials"
}

response = requests.post(url, headers=headers, data=data)

# Check the response
if response.status_code == 200:
    print("Token received successfully")
    print(response.json())
else:
    print("Failed to get token")
    print(response.status_code)
    print(response.text)
