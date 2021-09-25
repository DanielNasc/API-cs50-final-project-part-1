const express = require("express")
const http = require("http")

const app = express()
const server = http.createServer(app)

const { Server } = require("socket.io")
const io = new Server(server)

const { handle_msg } = require("./controllers/message_controller")
const {
    POST_USER, 
    ASK_FOR_FRIENDSHIP, 
    ACCEPT_REFUSE_FRIEND_REQUEST,
    LIST_FRIENDS_OR_FRIEND_REQUESTS
} = require("./controllers/user_controller")

const PORT = 3000 | process.env.PORT
 
app.use(express.urlencoded({extended: true}))

app.post("/add-user", POST_USER)
app.post("/add-friend", ASK_FOR_FRIENDSHIP)
app.post("/accept-or-refuse", ACCEPT_REFUSE_FRIEND_REQUEST)
app.post("/get-friends-list", LIST_FRIENDS_OR_FRIEND_REQUESTS)
app.post("/send-msg", handle_msg)

// io.on('connection', async (socket)=>{
//     const ID = socket.id
    
//     let chat_id
//     socket.on('message',async (msg) => {
//         chat_id = await handle_msg(msg)
//         if (!chat_id)
//         {
//             io.to(ID).emit("Fail", {"Message": "Invalid user(s)"})
//             socket.disconnect()
//         }
//         io.to(ID).emit("Sucess", {chat_id})
//     })
// })

server.listen(PORT, () => console.log("Serve running at port: ", PORT))