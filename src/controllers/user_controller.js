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
    arrayUnion
} 
= require("firebase/firestore")
const {encrypt_Hmac} = require("../services/encrypt")

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
    
    // preserve user privacy
    const USR =
    {
        username: encrypt_Hmac(username),
        email: encrypt_Hmac(email),
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
    await addDoc(USER_REF, {...USR})

    // return ":D" for now, I guess
    return res.send({"Message": ":D"})
}

async function ASK_FOR_FRIENDSHIP(req, res)
{
    // get data
    let { sender_id, receiver } = req.body

    if (!sender_id || !receiver)
        return res.send({"Message": "Missing information"})

    // encrypt the receiver's username to be able to look it up in the database
    receiver = encrypt_Hmac(receiver)

    // get sender reference
    const SENDER_REF = await getDoc(doc(db, `users/${sender_id}`))
    if (!SENDER_REF.exists())
        return res.send({"ERROR": "invalid sender"})

    // search the receiver in the database
    const RECEIVER_DOCS = await get_data("username", receiver)
    if (RECEIVER_DOCS.empty)
        return res.send({"ERROR": "invalid receiver"})

    // https://fireship.io/snippets/read-a-single-firestore-document/
    const RECEIVER_DOC = RECEIVER_DOCS.docs[0]
    const RECEIVER_ID = RECEIVER_DOC.id
    const RECEIVER_DATA = RECEIVER_DOC.data()

    // https://www.w3schools.com/jsref/jsref_includes_array.asp
    // check if the receiver is already a friend or if he already has a pending order from the sender
    if ((RECEIVER_DATA.friends.includes(SENDER_REF.id)) || (RECEIVER_DATA.pending.includes(SENDER_REF.id)))
        return res.send({"Message": "wdkwodkwfoeifri"})
    
    // otherwise, put the friend request on a list to be accepted or rejected later.
    // https://stackoverflow.com/questions/46757614/how-to-update-an-array-of-objects-with-firestore
    await updateDoc(doc(db, `users/${RECEIVER_ID}`), {pending: arrayUnion(SENDER_REF.id)})

    // return ":D" for now, I guess
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

module.exports = {POST_USER, ASK_FOR_FRIENDSHIP}