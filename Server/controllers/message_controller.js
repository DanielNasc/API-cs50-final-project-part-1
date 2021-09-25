const db = require("../services/firebase")
const {updateDoc,
    arrayUnion,
    Timestamp,
    doc
} = require("firebase/firestore")
const {
    get_data_by_query,
    create_doc,
    get_snap_and_ref,
} = require("../services/firestore_funcs")

async function handle_msg(req, res)
{
    // get data
    const {users, text, sender} = req.body
    if (!users || users.length != 2 || !text || !users.includes(sender))
        return res.send({"Message": "Invalid msg body"})
    
    // check if user 1 exist and is a friend of user 2
    const user_1 = await get_snap_and_ref("users", users[0])
    if(!user_1 || !user_1.SNAP.data().friends.includes(users[1]))
        return res.send({"Message": "Invalid user(s)"})

    // Message Obj
    const message = {
        sender,
        text,
        // https://firebase.google.com/docs/reference/js/firestore_.timestamp
        created_at: Timestamp.now()
    }

    // add message to database document (or create a new one if it doesn't exist)
    const MESSAGES = await get_data_by_query("chats", "users", users)
    if (!MESSAGES){
        const chat_id = await create_doc("chats", {users})
        await create_doc(`chats/${chat_id}/messages`, message)
        return res.send({"Message": chat_id})
    }

    await create_doc(`chats/${MESSAGES.id}/messages`, message)
    return res.send({"Message": MESSAGES.id})
}

module.exports = {
    handle_msg
}