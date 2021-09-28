from logging import error
import socketio

# Testing chat
users = ["XfPMwQRqkcOBhcY4GBlD", "fNspVjsajF0JX5pWv6Kl"]
sio = socketio.Client()

@sio.event
def connect():
    print('connection established')
    sio.emit('get_chat', users)

@sio.on("new_msg")
def show_new_msg(data):
    print(data)

@sio.on("Chat")
def show_chat_id(data):
    print(data)

@sio.on("Fail")
def show_error(data):
    error(data)

sio.connect("http://localhost:3000")