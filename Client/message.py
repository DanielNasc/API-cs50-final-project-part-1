from logging import error
import requests
# import socketio

# Tests
users = ("85VfHyY6sRvcg20gihxX", "gfKOtR1kTfQlkKkWigVj")
text = input("Message: ")
message_body = {
    "users": users,
    "text": text,
    "sender": users[0]
}
url = "http://localhost:3000/send-msg"
response = requests.post(url, data=message_body)
print(response.content)

# TEMP
# sio = socketio.Client()

# @sio.event
# def connect():
#     print('connection established')
#     text = input("Message: ")
#     message_body = {
#         "users": users,
#         "message": {
#             "text": text,
#             "sender": users[0]
#         }
#     }
#     sio.emit('message', message_body)

# @sio.on("Sucess")
# def show_chat_id(data):
#     print(data)

# @sio.on("Fail")
# def show_error(data):
#     error(data)

# sio.connect("http://localhost:3000")