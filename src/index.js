const express = require("express")
const app = express()
const {POST_USER, ASK_FOR_FRIENDSHIP} = require("./controllers/user_controller")

const PORT = 3000 | process.env.PORT
 
app.use(express.urlencoded({extended: true}))

app.post("/add-user", POST_USER)
app.post("/add-friend", ASK_FOR_FRIENDSHIP)

app.listen(PORT, () => console.log("Serve running at port: ", PORT))