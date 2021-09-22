function return_data(req, res)
{
    if (req.method != "POST")
    {
        return res.send({"Message": "Nope"})
    }

    const user = req.body
    return res.send(user)
}

export default return_data