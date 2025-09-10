require('dotenv').config()
const path = require('path');
const app = require('./src/app')

app.listen(3000, () => {
    console.log("server is running on port 3000")
})

