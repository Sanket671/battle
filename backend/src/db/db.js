const mongoose = require('mongoose')

async function connectdb(){
    await mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("connected to db")
    })
    .catch((err) => {
        console.log(err)
    })
}

module.exports = connectdb 