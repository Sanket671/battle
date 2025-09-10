const express = require('express')
const {registerController, loginController, userController} = require('../controllers/auth.controller')
const router = express.Router()

router.post('/register', registerController)

router.post('/login', loginController)

router.get('/user', userController)

module.exports = router 
