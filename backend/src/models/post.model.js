const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    image : String,
    caption : String,
    user : {
        type : mongoose.Schema.ObjectId,
        ref : "users"   // in post.model.js, we have created user named model, so automatically users collection will be created 
    }
})

const postModel = mongoose.model("post", postSchema)

module.exports = postModel