const express = require("express")
const http = require("http")

const app = express()
const server = http.createServer(app)

const { Server } = require("socket.io")
const io = new Server(server)

const routes = require("./routes")
const { chat_controller } = require("./controllers/message_controller")

const PORT = 3000 | process.env.PORT
 
app.use(express.urlencoded({extended: true}))
app.use(routes)

io.on('connection', async (socket) => { await chat_controller(socket, io) })

server.listen(PORT, () => console.log("Serve running at port: ", PORT))