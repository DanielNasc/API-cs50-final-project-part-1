const express = require("express")
const app = express()
const POST_USER = require("./controllers/post_user")

const PORT = 3000 | process.env.PORT
 
app.use(express.urlencoded({extended: true}))

app.post("/add-user", POST_USER)

app.listen(PORT, () => console.log("Serve running at port: ", PORT))