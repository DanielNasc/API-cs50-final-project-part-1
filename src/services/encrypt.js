require("dotenv").config()
const crypto = require("crypto")
const cryptoJs = require("crypto-js")

// https://dev.to/aditya278/understanding-and-implementing-password-hashing-in-nodejs-2m84
// get secret key for user data encryption
const SECRET_KEY = process.env.SECRET_KEY
function encrypt_Hmac(text)
{
    const HASHED_STR = crypto.createHmac('sha256', SECRET_KEY)
                        .update(text)
                        .digest('hex')
    return HASHED_STR
}

function encrypt_AES(text)
{
    const ciphertext = cryptoJs.AES.encrypt(text, SECRET_KEY).toString()
    return ciphertext
}

function decrypt_AES(ciphertext)
{
    const bytes = cryptoJs.AES.decrypt(ciphertext, SECRET_KEY)
    const text = bytes.toString(cryptoJs.enc.Utf8)
    return text
}

module.exports = {encrypt_Hmac, encrypt_AES, decrypt_AES}