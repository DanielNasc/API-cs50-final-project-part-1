const db = require("../services/firebase")
const { doc, updateDoc, arrayUnion, getDocs, collection, query, where } = require("firebase/firestore")
const {encrypt_Hmac} = require("../services/encrypt")
const {get_snap_and_ref, get_data_by_query, create_doc, get_username, accept_friend_request, reject_friend_request} = require("../services/firestore_funcs")

// DOCUMENTATION
// https://firebase.google.com/docs/firestore/manage-data/add-data
// https://firebase.google.com/docs/firestore/query-data/get-data
// https://firebase.google.com/docs/firestore/query-data/queries


const U = "users"

async function post_user(req, res) 
{
    // Get POST data
    const { username, email, pass } = req.body
    
    if (!email || !pass || !username)
        return res.send({"ERROR": "Missing information"})
    
    // usr object
    const USR =
    {
        username,
        email,
        pass: encrypt_Hmac(pass),
        friends: [],
        pending: []
    }
    
    // check if the username exists
    if ((await get_data_by_query(U, "username", USR.username)))
        return res.send({"Message": "Username already exists"})
    
    // check if the email is already being used
    if ((await get_data_by_query(U, "email", USR.email)))
        return res.send({"Message": "Try another email"})

    // add user to database
    const id = await create_doc(U, USR)

    // return user id
    return res.send({id})
}

async function login(req, res)
{
    // get data
    const { email, pass } = req.body

    const REF = collection(db, U)

    const q = query(REF, where("email", "==", email), where("pass", "==", encrypt_Hmac(pass)))
    const docs = await getDocs(q)
    if (docs.empty)
        return res.send({"Message": "Invalid Email/Pass"})
    const usr_id = docs.docs[0].id

    return res.send({usr_id})
}

async function send_friend_request(req, res)
{
    // get data
    let { sender_id, receiver } = req.body

    if (!sender_id || !receiver)
        return res.send({"Message": "Missing information"})

    // encrypt the receiver's username to be able to look it up in the database
    // receiver = encrypt_AES(receiver)

    // get sender reference
    const sender = (await get_snap_and_ref(U, sender_id))
    if (!sender)
        return res.send({"ERROR": "invalid sender"})
    const sender_snap = sender.SNAP

    // search the receiver in the database
    const receiver_snap = await get_data_by_query(U, "username", receiver)
    if (!receiver_snap)
        return res.send({"ERROR": "invalid receiver"})

    // https://fireship.io/snippets/read-a-single-firestore-document/
    const receiver_data = receiver_snap.data()

    // https://www.w3schools.com/jsref/jsref_includes_array.asp
    // check if the receiver is already a friend or if he already has a pending order from the sender
    if (
        (receiver_data.friends.includes(sender_snap.id)) || 
        (receiver_data.pending.includes(sender_snap.id)) || 
        (sender_snap.data().pending.includes(receiver_snap.id))
        )
        return res.send({"Message": "wdkwodkwfoeifri"})
    
    // otherwise, put the friend request on a list to be accepted or rejected later.
    // https://stackoverflow.com/questions/46757614/how-to-update-an-array-of-objects-with-firestore
    await updateDoc(doc(db, U, receiver_snap.id), {pending: arrayUnion(sender_snap.id)})

    // return ":D" for now, I guess
    return res.send({"Message": ":D"})
}

async function accept_refuse_friend_request(req, res)
{
    // get data
    const { receiver_id, sender_id, accepted } = req.body

    if (!receiver_id || !sender_id)
        return res.send({"Message": "bruh"})

    // get receiver reference and snapshot on database
    const receiver = await get_snap_and_ref(U, receiver_id)
    if (!receiver)
        return res.send({"Message": "Invalid Receiver"})

    // get sender reference and snapshot on database
    const sender = await get_snap_and_ref(U, sender_id)
    if (!sender)
        return res.send({"Message": "Invalid Sender"})

    // check if the receiver really has a friend request from the sender (maybe I'll implement a system to block users, then they won't be able to send friend requests)
    const receiver_data = receiver.SNAP.data()
    if (!receiver_data.pending.includes(sender.SNAP.id))
        return res.send({"e": "eeeeeeee"})
    
    // accept or refuse frined request
    accepted ? 
    await accept_friend_request(receiver.REF, sender.REF, receiver.SNAP.id, sender.SNAP.id):
    await reject_friend_request(receiver.REF, sender.SNAP.id)

    // return :D for now
    return res.send({"Message": ":D"})
}

async function list_friends_or_friend_requests(req, res)
{
    // get data
    const { user_id, friends } = req.body
    if (!user_id)
        return res.send({"Message": "Invalid user id"})

    // get user data from database
    const user = await get_snap_and_ref(U, user_id)
    if (!user)
        return res.send({"Message": "Invalid user"})

    // get friend list or request list
    const ids_list = friends ?
    user.SNAP.data().friends :
    user.SNAP.data().pending

    // get user names from their ids
    const usernames = []
    
    for (const id of ids_list)
    {
        const username = await get_username(id)
        usernames.push(username)
    }

    // return list
    return res.send({list: usernames})
}

module.exports = {
    post_user, 
    login,
    send_friend_request, 
    accept_refuse_friend_request,
    list_friends_or_friend_requests
}