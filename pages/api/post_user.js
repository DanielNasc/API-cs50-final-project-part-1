function POST_USER(req, res)
{
    // Only the POST method is allowed
    if (req.method != "POST")
    {
        return res.send({"Message": `${req.method} is not POST`})
    }

    // Get POST data
    const body = req.body
    const email = body.email
    const pass = body.pass

    if (!email || !pass)
        return res.send({"ERROR": "Missing information"})
    
    
    return res.send({"Message": "Nice"})
}

export default POST_USER