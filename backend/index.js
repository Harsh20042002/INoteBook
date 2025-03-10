const connectToMongo = require('./db');
const express = require('express')
const cors = require('cors')

connectToMongo();
const app = express() 
const port = 5000

app.use(cors())

// This middleware is used to handle and process JSON data sent by clients, such as data submitted in the request body of a POST or PUT request 
app.use(express.json())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes',require('./routes/notes'))

app.listen(port, () => {
  console.log(`iNotebook backend listening on port ${port}`)
})