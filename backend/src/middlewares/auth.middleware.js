const userModel = require("../models/user.model")
const jwt = require('jsonwebtoken')

async function authMiddleware(req,res,next){ 
    // take token from user side(req.cookies) => req.cookies.token (in req.cookies, token named token) & validate it
    const token = req.cookies.token
    if(!token){
        return res.status(401).json({
            message : "Unauthorised Access, please login first"
        })
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const user = await userModel.findOne({
            username : decoded.username
        })
        req.user = user
        next()
    }catch(err){
        return res.status(401).json({
            message : "Invalid token, please login again"
        })
    }
}

module.exports = authMiddleware