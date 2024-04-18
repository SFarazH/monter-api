const express = require('express')
const app = express()
const dbConnect = require('./db/dbConnect')


dbConnect()
app.listen(3001, ()=>{
    console.log('Listening on port 3001')
})