const express = require("express")
const app = express()
const {POST_USER, ASK_FOR_FRIENDSHIP, ACCEPT_REFUSE_FRIEND_REQUEST} = require("./controllers/user_controller")

const PORT = 3000 | process.env.PORT
 
app.use(express.urlencoded({extended: true}))

app.post("/add-user", POST_USER)
app.post("/add-friend", ASK_FOR_FRIENDSHIP)
app.post("/accept-or-refuse", ACCEPT_REFUSE_FRIEND_REQUEST)

app.listen(PORT, () => console.log("Serve running at port: ", PORT))