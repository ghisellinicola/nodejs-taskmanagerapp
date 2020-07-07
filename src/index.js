const express = require('express')
const mongoose = require('./db/mongoose')
const chalk = require('chalk')

const testRouter = require('./routers/test')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const server = express()

// have environment variables consistent on cross OS is a pain! 
// for this reason we will use the following npm module => env-cmd
// env-cmd -f config/dev.env <COMMAND TO RUN> => this loads the variables!
const port = process.env.PORT // || 3000

// register a middleware function to use!
// next is specific for the middleware use!
server.use(express.json())

server.use(testRouter)
server.use(userRouter)
server.use(taskRouter)


server.listen(port, () => {
    console.log(chalk.blueBright('Express server is running on port: ' + port + '!'))
})

// ------------------------------------------------------------------------

// hashing passwords
// const bcryptjs = require('bcryptjs')
// const jwt = require('jsonwebtoken')

// const { Server } = require('mongodb')

// const Task = require('./model/task')
// const User = require('./model/user')
// const multer = require('multer')

// // multer configuration (depending on with file the application must manage)
// const upload = multer({
//     dest: 'images'
// })

// server.post('/upload', upload.single('upload'), (req, res) => {
//     res.status(200).send()
// })

const myFunction = async () =>{

    // const pwd = 'Green#987'

    // // arguments: password to hash, hash runs
    // // few runs are not secure! too many runs are very unefficient!
    // const hashedPwd = await bcryptjs.hash(pwd,8)

    // console.log(pwd)
    // // hashed password cannot be reversed by design! This is really secure!
    // console.log(hashedPwd)


    // const isMatch = await bcryptjs.compare('reen#987',hashedPwd)

    // if(isMatch){
    //     console.log('Passwords Match!')
    // } else {
    //     console.log('Passwords do not Match!')
    // }

    // ------------------------------------------------------------------------

    // jwt.sign arguments -> object (objectid), secret (sequence of characters)
    // const token = jwt.sign({_id: 'abc123'},'thisismynewcourse', {expiresIn: '3 seconds'})
    // console.log(token)

    // // token is made of 3 pieces:
    // // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 => info about the token (header)
    // //.
    // //eyJfaWQiOiJhYmMxMjMiLCJpYXQiOjE1OTM3NzAxODV9 => contains the provided data (pauload/body)
    // //.
    // //WDT_Q3YQYeM68kH0nvGQFxxVXk6QdiN58tyWwuv24kc => signature to verify the token!
    // // the token must be verifiable!


    // try {
    //     const data = jwt.verify(token,'thisismynewcourse')
    // console.log(data)
    // } catch (error) {
    //     console.log('The secret is wrong or has expired!')
    // }

    // ------------------------------------------------------------------------
    
    // //ObjectId("5f032e023932c83ff204808b") -> something new
    // //ObjectId("5f032e303932c83ff204808e") -> allianz fantini
    
    // const task = await Task.findById('5f032e303932c83ff204808e')

    // await task.populate('owner').execPopulate()

    // console.log(task.owner)
    // console.log(task.owner.name)
 
    // //ObjectId("5f032e1a3932c83ff204808c") -> Gloria
    // //ObjectId("5f032c8f755736391b24c0f6") -> Nicola

    // const user = await User.findById('5f032e1a3932c83ff204808c')

    // // we are populating a virtual field!
    // await user.populate('tasks').execPopulate()
    // console.log(user.tasks)

     // ------------------------------------------------------------------------
}


// myFunction()

