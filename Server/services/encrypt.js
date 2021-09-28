require("dotenv").config()
const crypto = require("crypto")

// https://dev.to/aditya278/understanding-and-implementing-password-hashing-in-nodejs-2m84
// get secret key for user data encryption
const algorithm = 'aes-256-cbc'
const SECRET_KEY = process.env.SECRET_KEY
const IV = process.env.IV

function encrypt_Hmac(text)
{
    const HASHED_STR = crypto.createHmac('sha256', SECRET_KEY)
                        .update(text)
                        .digest('hex')
    return HASHED_STR
}

module.exports = {encrypt_Hmac}