import requests

# Tests
users = ["85VfHyY6sRvcg20gihxX", "gfKOtR1kTfQlkKkWigVj"]
text = input("Message: ")
message_body = {
    "users": users,
    "text": text,
    "sender": users[0]
}
url = "http://localhost:3000/send-msg"
response = requests.post(url, data=message_body)
print(response.content)