const db = require("./firebase")
const { 
    doc,
    getDoc,
    collection,
    where,
    query,
    getDocs,
    addDoc
 } = require("firebase/firestore")

 async function create_doc(collec, obj)
 {
    const REF = collection(db, collec)
    const id = (await addDoc(REF, {...obj})).id
    return id
 }

async function get_snap_and_ref(collec, id)
{
    const REF = doc(db, collec, id)
    const SNAP = await getDoc(REF)
    if (!SNAP.exists())
        return false
    return {REF, SNAP}
}

async function check_if_this_exists(collec, id)
{
    const REF = doc(db, collec, id)
    const SNAP = await getDoc(REF)
    return SNAP.exists()
}

async function get_data_by_query(collec, prop, value)
{
    // get the reference of the collection
    const REF = collection(db, collec)

    // check if query exists
    const q = query(REF, where(prop, "==", value))
    const docs = await getDocs(q)
    if (docs.empty)
        return false
    return docs.docs[0]
}


module.exports = {
    get_snap_and_ref, 
    check_if_this_exists, 
    get_data_by_query,
    create_doc
}