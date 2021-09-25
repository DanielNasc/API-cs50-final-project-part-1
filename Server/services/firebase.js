require("dotenv").config()
const { initializeApp } = require("firebase/app")
const { getFirestore } = require("firebase/firestore")

// DOCUMENTATION
// https://firebase.google.com/docs/firestore/quickstart

const CONFIG = 
{
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID
}

initializeApp(CONFIG)
const db = getFirestore()
module.exports = db