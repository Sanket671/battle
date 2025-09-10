const { Server } = require("socket.io");
const cookie = require('cookie')
const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')
const {generateContent,generateVector} = require('../services/ai.service')
const messageModel = require('../models/message.model')
const {createMemory, queryMemory} = require('../services/vector.service')

async function initSocketServer(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5000", // Your frontend URL
            methods: ["GET", "POST"],
            credentials: true,
            transports: ['websocket', 'polling'] // Ensure both transports are enabled
        }
    })

    // Middleware for every Socket Connection
    io.use(async (socket, next) => { 
        try {
            const cookies = cookie.parse(socket.handshake.headers?.cookie || "")
            
            if(!cookies.token){
                return next(new Error("Authentication error: No token provided"))
            }
            const token = cookies.token

            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            const user = await userModel.findById(decoded.id);

            if (!user) {
                return next(new Error("Authentication error: User not found"));
            }

            socket.user = user
            next()
        } catch (error) {
            next(new Error("Authentication error: Invalid token"))
        }
    })

    // Connection event
    io.on("connection", (socket) => { 
        console.log('User connected:', socket.user.email)
        
        socket.on('ai-message', async (message) => {
            // Add validation for message format
            if (!message || typeof message !== 'object') {
                console.log("ERROR: Invalid message format");
                socket.emit('error', { message: 'Invalid message format' });
                return;
            }

            if(!message.chat || !message.content){
                console.log("ERROR: Give chatID as chat along with content of message")
                socket.emit('error', { message: 'Missing chat ID or content' });
                return
            }

            try {
                // User req => storing to DB
                const reqMessage = await messageModel.create({
                    user: socket.user._id,
                    chat: message.chat,
                    content: message.content,
                    role: "user"
                })

                const requestVectors = await generateVector(message.content)
                
                const memory = await queryMemory({
                    queryVector: requestVectors,
                    limit: 3,
                    metadata: {}
                })

                await createMemory({
                    vectors: requestVectors,
                    metadata: {
                        chat: message.chat,
                        user: socket.user._id,
                        text: message.content
                    },
                    messageId: reqMessage._id
                })

                // Get chat history
                const chatHistory = (await messageModel.find({
                    chat: message.chat
                }).sort({createdAt: -1})
                .limit(20)
                .lean())
                .reverse()

                // Generate AI response
                const response = await generateContent(
                    chatHistory.map(item => ({
                        role: item.role,
                        content: item.content
                    }))
                );

                // AI res => storing to DB
                const resMessage = await messageModel.create({
                    user: socket.user._id,
                    chat: message.chat,
                    content: response,
                    role: "model"
                })

                const responseVectors = await generateVector(response)

                await createMemory({
                    vectors: responseVectors,
                    metadata: {
                        chat: resMessage.chat,
                        user: socket.user._id,
                        text: response
                    },
                    messageId: resMessage._id
                })

                // Send response back to user
                socket.emit('ai-response', {
                    content: response,
                    chat: message.chat
                })
            } catch (error) {
                console.error("Error processing message:", error)
                socket.emit('error', { message: 'Failed to process message' })
            }
        })
        
        socket.on('disconnect', (reason) => {
            console.log('User disconnected:', socket.user.email, 'Reason:', reason)
        })
    })
}

module.exports = initSocketServer