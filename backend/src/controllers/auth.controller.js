const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

async function registerController(req,res){
    const {username,password} = req.body

    const isAlreadyExist = await userModel.findOne({
        username : username
    })
    if(isAlreadyExist){
        return res.status(401).json({
            message : "User already exists"
        })
    }

    try {
        const user = await userModel.create({
            username : username,
            password : await bcrypt.hash(password, 10) 
        })

        console.log("User Created")

        const token = await jwt.sign({id : user._id}, process.env.JWT_SECRET_KEY)

        res.cookie('token', token)

        return res.status(201).json({
            message : "Registered Successfully"
        })

    } catch (err) {
        console.log(err)
    }

}

async function loginController(req,res){
    const {username, password} = req.body
    
    const user = await userModel.findOne({username : username})
    if(!user){
        return res.status(401).json({
            message : "User Doesn't Exist"
        })
    }
    const isCorrectPass = await bcrypt.compare(password, user.password)
    if(!isCorrectPass){
        return res.status(401).json({
            message : "Incorrect password"
        })
    }
    
    const token =  jwt.sign({username : username}, process.env.JWT_SECRET_KEY)
    res.cookie('token', token)

    return res.json({
        message : "logged in Successfully"
    })
}

async function userController(req,res){
    const {token} = req.cookies // req.cookies.token 

    if(!token){
        return res.status(401).json({
            message : "Login First To Access user"
        })
    }
    try{
        const isValid = jwt.verify(token, process.env.JWT_SECRET_KEY)
    } catch(err){
        return res.json({
            err
        })
    }

    res.status(200).json({
        message : "Verified User[protected]"
    })
}

module.exports = {
    registerController,
    loginController,
    userController
}
