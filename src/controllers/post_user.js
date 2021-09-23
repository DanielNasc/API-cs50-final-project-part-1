require("dotenv").config()
const db = require("../services/firebase")
const { collection, query, where, getDocs, addDoc } = require("firebase/firestore")
const crypto = require("crypto")

// get secret key for user data encryption
const SECRET_KEY = process.env.SECRET_KEY

async function POST_USER(req, res) 
{
    // Get POST data
    const {username, email, pass} = req.body
    
    if (!email || !pass || !username)
        return res.send({"ERROR": "Missing information"})
    
    // preserve user privacy
    const USR =
    {
        username: encrypt(username),
        email: encrypt(email),
        pass: encrypt(pass)
    }

    // DOCUMENTATION
    // https://firebase.google.com/docs/firestore/manage-data/add-data
    // https://firebase.google.com/docs/firestore/query-data/get-data
    // https://firebase.google.com/docs/firestore/query-data/queries
    // get the reference of the users' document collection
    const USER_REF = collection(db, "users")

    // check if the username exists
    const usename_query = query(USER_REF, where("username", "==", USR.username))
    const username_docs = await getDocs(usename_query)

    if (!username_docs.empty)
        return res.send({"Message": "Username already exists"})
    
    // check if the email is already being used
    const email_query = query(USER_REF, where("email", "==", USR.email)) 
    const email_docs = await getDocs(email_query)

    if (!email_docs.empty)
        return res.send({"Message": "Try another email"})

    // add user to database
    await addDoc(USER_REF, {...USR})

    // return OK
    return res.send({"Message": ":D"})
}

function encrypt(text)
{
    // https://dev.to/aditya278/understanding-and-implementing-password-hashing-in-nodejs-2m84
    const HASHED_STR = crypto.createHmac('sha256', SECRET_KEY)
                        .update(text)
                        .digest('hex')
    return HASHED_STR
}

module.exports = POST_USER