const express = require("express")
const http = require("http")

const app = express()
const server = http.createServer(app)

const { Server } = require("socket.io")
const io = new Server(server)

const { send_msg, chat_controller } = require("./controllers/message_controller")
const { post_user, login, send_friend_request,  accept_refuse_friend_request, list_friends_or_friend_requests, } = require("./controllers/user_controller")

const PORT = 3000 | process.env.PORT
 
app.use(express.urlencoded({extended: true}))

app.post("/register", post_user)
app.post("/login", login)
app.post("/add-friend", send_friend_request)
app.post("/accept-or-refuse", accept_refuse_friend_request)
app.post("/get-friends-list", list_friends_or_friend_requests)
app.post("/send-msg", send_msg)

io.on('connection', async (socket) => { await chat_controller(socket, io) })

server.listen(PORT, () => console.log("Serve running at port: ", PORT))