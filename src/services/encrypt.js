require("dotenv").config()
const crypto = require("crypto")

// get secret key for user data encryption
const SECRET_KEY = process.env.SECRET_KEY

function encrypt_Hmac(text)
{
    // https://dev.to/aditya278/understanding-and-implementing-password-hashing-in-nodejs-2m84
    const HASHED_STR = crypto.createHmac('sha256', SECRET_KEY)
                        .update(text)
                        .digest('hex')
    return HASHED_STR
}

module.exports = {encrypt_Hmac}