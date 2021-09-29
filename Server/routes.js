const { Router } = require("express")

const { send_msg } = require("./controllers/message_controller")
const { post_user, login, send_friend_request,  accept_refuse_friend_request, list_friends_or_friend_requests, remove_friend } = require("./controllers/user_controller")
const routes = Router()

routes.post("/register", post_user)
routes.post("/login", login)
routes.post("/add-friend", send_friend_request)
routes.post("/accept-or-refuse", accept_refuse_friend_request)
routes.post("/get-friends-list", list_friends_or_friend_requests)
routes.post("/send-msg", send_msg)
routes.post("/remove-friend", remove_friend)

module.exports = routes