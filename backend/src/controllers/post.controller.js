const postModel = require('../models/post.model')
const generateCaption = require('../service/ai.service')
const uploadFileImagekit = require('../service/storage.service')

async function createPostController(req,res){
    const file = req.file 
    const base64Image = file.buffer.toString("base64")
    
    const caption = await generateCaption(base64Image)
    const image = await uploadFileImagekit(base64Image, "image.jpg")
    
    const post = await postModel.create({
        image : image.url,
        caption : caption,
        user : req.user // we already stored userdata in req.user
    })

    res.json({
        message : "Post created Successfully",
        post : post
    })
}

module.exports = {createPostController}
