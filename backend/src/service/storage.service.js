// Imagekit

var ImageKit = require("imagekit");

var imagekit = new ImageKit({
    publicKey : process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey : process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint : process.env.IMAGEKIT_URL_ENDPOINT
});

async function uploadFile(file,filename){ // refernce from documentation and only filled required things
    const response = await imagekit.upload({
        file : file,
        fileName : filename,
        folder : "social_Media"
    })
    return response
}

module.exports = uploadFile