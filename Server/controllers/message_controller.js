const db = require("../services/firebase")
const { Timestamp, onSnapshot, query, orderBy, collection, where } = require("firebase/firestore")
const { get_data_by_query, create_doc, get_snap_and_ref, order_limit_data, get_username } = require("../services/firestore_funcs")
 
async function send_msg(req, res)
{
    // get data
    let {users, text, sender} = req.body
    if (!users || users.length != 2 || !text || !users.includes(sender))
        return res.send({"Message": "bruh"})
    
    // check if user 1 exist and is a friend of user 2
    const user_1 = await get_snap_and_ref("users", users[0])
    if(!user_1 || !user_1.SNAP.data().friends.includes(users[1]))
        return res.send({"Message": "bruh"})
    
    /// sort the array to avoid bugs when comparing the compare with the database
    users = users.sort()
        
    // Message Obj
    const message = {
        sender,
        text,
        // https://firebase.google.com/docs/reference/js/firestore_.timestamp
        created_at: Timestamp.now().seconds
    }

    // add message to database document (or create a new one if it doesn't exist)
    const chat = await get_data_by_query("chats", "users", users)
    if (!chat){
        const chat_id = await create_doc("chats", {users})
        await create_doc(`chats/${chat_id}/messages`, message)
        return res.send({"Message": ":D"})
    }

    await create_doc(`chats/${chat.id}/messages`, message)
    return res.send({"Message": ":D"})
}


async function chat_controller(socket, io)
{
    console.log("Connected to socket")
    // get socket id
    const ID = socket.id
    // initializing chat_id
    let chat_id

    socket.on('get_chat',async (users) => {
        // sort the array to avoid bugs when comparing the compare with the database
        users = users.sort()
        // get chat id
        chat_id = await connect_to_chat(users)
        if (!chat_id)
        {
            io.to(ID).emit("Fail", {"Message": "Invalid user(s)"})
            socket.disconnect()
        }
        io.to(ID).emit("Chat", {"Message": ":D"})

        // get the users id from their id
        const usernames = {}
        for (const user_id of users)
        {
            const username = await get_username(user_id)
            usernames[user_id] = username
        }

        // sending the messages that were fetched from the database
        const messages = await get_chat_messages(chat_id, usernames)
        messages.forEach(message => {
            io.to(ID).emit("new_msg", message)
        })


        // The first snapshot of the query contains added events for all current documents matching the query.
        // So we have to limit the query to return only documents later than those already sent to the client.
        // But we won't have the date the last message was created, if there are no messages, so in this case we put the time 0
        const min_time = messages[messages.length - 1] ? 
        messages[messages.length - 1]["created_at"] :
        0
        // Get collection reference and query
        const REF = collection(db, "chats", chat_id, "messages")
        const q = query(REF, where("created_at", ">", min_time), orderBy("created_at"))

        // listen database for new messages
        onSnapshot(q, (snap)=>{
            snap.docChanges().forEach(change => {
                // https://stackoverflow.com/questions/48965147/listen-only-to-additions-to-a-cloud-firestore-collection
                // https://firebase.google.com/docs/firestore/query-data/listen.html#view_changes_between_snapshots
                if (change.type === "added")
                {
                    // send new messages to the user
                    const {sender, text} = change.doc.data()
                    const msg_obj = {
                        sender: usernames[sender],
                        text
                    }
                    io.to(ID).emit("new_msg", msg_obj)
                }
            })
        })
    })
}

async function connect_to_chat(users)
{
    if (!users || users.length != 2)
        return false
    // check if user 1 exist and is a friend of user 2
    const user_1 = await get_snap_and_ref("users", users[0])
    if(!user_1 || !user_1.SNAP.data().friends.includes(users[1]))
        return false

    // returns the id of an existing (or new) chat
    const CHAT = await get_data_by_query("chats", "users", users)
    if (!CHAT){
        const chat_id = await create_doc("chats", {users})
        return chat_id
    }
    return CHAT.id
}

async function get_chat_messages(chat_id, usernames)
{
    // get the last 25 messages
    const msg_docs = await order_limit_data(`chats/${chat_id}/messages`, "created_at", 25)

    const messages = []
    msg_docs.forEach(message => {
        // change user id by his name
        msg_data = message.data()
        msg_data.sender =  usernames[msg_data.sender]
        messages.push(msg_data)
    })

    return messages
}

module.exports = {
    get_chat_messages,
    connect_to_chat,
    send_msg,
    chat_controller
}