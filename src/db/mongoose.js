const mongoose = require('mongoose');

//there is no need to esplicitally create the db!

// const userCollection = 'users'
// const taskCollection = 'tasks'

// const databaseName = process.env.MONGODB_DBNAME
// const protocol = process.env.MONGODB_PROTOCOL
// const ip = process.env.MONGODB_HOST
// const port = process.env.MONGODB_PORT
// const connectionURL = protocol + '://' + ip + ':' + port + '/' + databaseName
const connectionURL = process.env.MONGODB_URL

const options = { 
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}

try {
    mongoose.connect(connectionURL, options)
    console.log('Correctly connected to ' + connectionURL)
} catch (error) {
    console.log('Unable to connect to the DB!')
    console.log(error)
}