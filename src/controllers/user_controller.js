const db = require("../services/firebase")
const 
{ 
    collection, 
    query, 
    where, 
    getDocs, 
    addDoc, 
    doc, 
    getDoc, 
    updateDoc,
    arrayUnion,
    arrayRemove
} 
= require("firebase/firestore")
const {encrypt_Hmac, encrypt_AES, decrypt_AES} = require("../services/encrypt")

// DOCUMENTATION
// https://firebase.google.com/docs/firestore/manage-data/add-data
// https://firebase.google.com/docs/firestore/query-data/get-data
// https://firebase.google.com/docs/firestore/query-data/queries

async function POST_USER(req, res) 
{
    // Get POST data
    const {username, email, pass} = req.body
    
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
    if (!(await get_data("username", USR.username)).empty)
        return res.send({"Message": "Username already exists"})
    
    // check if the email is already being used
    if (!(await get_data("email", USR.email)).empty)
        return res.send({"Message": "Try another email"})

    // add user to database
    const USER_REF = collection(db, "users")
    const id = (await addDoc(USER_REF, {...USR})).id

    // return user id
    return res.send({id})
}

async function ASK_FOR_FRIENDSHIP(req, res)
{
    // get data
    let { sender_id, receiver } = req.body

    if (!sender_id || !receiver)
        return res.send({"Message": "Missing information"})

    // encrypt the receiver's username to be able to look it up in the database
    // receiver = encrypt_AES(receiver)

    // get sender reference
    const SENDER_REF = await getDoc(doc(db, "users", sender_id))
    if (!SENDER_REF.exists())
        return res.send({"ERROR": "invalid sender"})

    // search the receiver in the database
    const RECEIVER_DOCS = await get_data("username", receiver)
    if (RECEIVER_DOCS.empty)
        return res.send({"ERROR": "invalid receiver"})

    // https://fireship.io/snippets/read-a-single-firestore-document/
    const RECEIVER_SNAP = RECEIVER_DOCS.docs[0]
    const RECEIVER_ID = RECEIVER_SNAP.id
    const RECEIVER_DATA = RECEIVER_SNAP.data()

    // https://www.w3schools.com/jsref/jsref_includes_array.asp
    // check if the receiver is already a friend or if he already has a pending order from the sender
    if (
        (RECEIVER_DATA.friends.includes(SENDER_REF.id)) || 
        (RECEIVER_DATA.pending.includes(SENDER_REF.id)) || 
        (SENDER_REF.data().pending.includes(RECEIVER_SNAP.id))
        )
        return res.send({"Message": "wdkwodkwfoeifri"})
    
    // otherwise, put the friend request on a list to be accepted or rejected later.
    // https://stackoverflow.com/questions/46757614/how-to-update-an-array-of-objects-with-firestore
    await updateDoc(doc(db, "users", RECEIVER_ID), {pending: arrayUnion(SENDER_REF.id)})

    // return ":D" for now, I guess
    return res.send({"Message": ":D"})
}

async function ACCEPT_REFUSE_FRIEND_REQUEST(req, res)
{
    // get data
    const { receiver_id, sender_id, accepted } = req.body

    if (!receiver_id || !sender_id)
        return res.send({"Message": "bruh"})

    // get receiver reference and snapshot on database
    const RECEIVER = await get_snap_and_ref("users", receiver_id)
    if (!RECEIVER)
        return res.send({"Message": "Invalid Receiver"})

    // get sender reference and snapshot on database
    const SENDER = await get_snap_and_ref("users", sender_id)
    if (!SENDER)
        return res.send({"Message": "Invalid Sender"})

    // check if the receiver really has a friend request from the sender (maybe I'll implement a system to block users, then they won't be able to send friend requests)
    const RECEIVER_DATA = RECEIVER.SNAP.data()
    if (!RECEIVER_DATA.pending.includes(SENDER.SNAP.id))
        return res.send({"e": "eeeeeeee"})
    
    // accept or refuse frined request
    accepted ? 
    await accept_friend_request(RECEIVER.REF, SENDER.REF, RECEIVER.SNAP, SENDER.SNAP):
    await reject_friend_request(RECEIVER.REF, SENDER.SNAP)

    // return :D for now
    return res.send({"Message": ":D"})
}

async function get_data(prop, value)
{
    // get the reference of the users' document collection
    const USER_REF = collection(db, "users")

    // check if query exists
    const q = query(USER_REF, where(prop, "==", value))
    const docs = await getDocs(q)
    return docs 
}


async function LIST_FRIENDS_OR_FRIEND_REQUESTS(req, res)
{
    // get data
    const {user_id, friends} = req.body
    if (!user_id)
        return res.send({"Message": "Invalid user id"})

    // get user data from database
    const USER = await get_snap_and_ref("users", user_id)
    if (!USER)
        return res.send({"Message": "Invalid user"})

    // get friend list or request list
    const ids_list = friends ?
    USER.SNAP.data().friends :
    USER.SNAP.data().pending

    // map function
    async function map_ids(id)
    {
        const friend = await getDoc(doc(db, "users", id))
        username = friend.data().username
        return username
    }

    // get user names from their ids
    // https://stackoverflow.com/questions/40140149/use-async-await-with-array-map
    const FRIENDS_NAMES = await Promise.all(ids_list.map(map_ids))

    // return list
    return res.send({list: FRIENDS_NAMES})
}

// TEMP =========================================================
async function get_snap_and_ref(collection, id)
{
    const REF = doc(db, collection, id)
    const SNAP = await getDoc(REF)
    if (!SNAP.exists())
        return false
    return {REF, SNAP}
}

async function accept_friend_request(RECEIVER_REF, SENDER_REF, RECEIVER_SNAP, SENDER_SNAP)
{
    await updateDoc(RECEIVER_REF, {pending: arrayRemove(SENDER_SNAP.id), friends: arrayUnion(SENDER_SNAP.id)})
    await updateDoc(SENDER_REF, {friends: arrayUnion(RECEIVER_SNAP.id)})
    return
}

async function reject_friend_request(RECEIVER_REF, SENDER_SNAP)
{
    await updateDoc(RECEIVER_REF, {pending: arrayRemove(SENDER_SNAP.id)})
    return
}

module.exports = {
    POST_USER, 
    ASK_FOR_FRIENDSHIP, 
    ACCEPT_REFUSE_FRIEND_REQUEST,
    LIST_FRIENDS_OR_FRIEND_REQUESTS
}