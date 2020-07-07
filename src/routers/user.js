const express = require('express')
const User = require('../model/user')
const chalk = require('chalk')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const emailer = require('../emails/account')

// multer configuration (depending on with file the application must manage)
const upload = multer({
    // dest: 'avatar', => MUST REMOVE THIS TO SAVE THE FILE IN THE DB!
    limits: {
        fileSize: 1000000 //1Mb
    },
    fileFilter(req, file, cb){ // will be called internally by multer
        
        // if(!file.originalname.endsWith('.pdf')){
        //     return cb(new Error('File must be a PDF!'))
        // }
        // if(!file.originalname.match(/\.(doc|docx)$/)) {
        //     return cb(new Error('File must be a Word Document!'))
        // }
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('File must be am image!'))
        }

        cb(undefined, true) // upload should be expected

        // GENERAL BEHAVIOUR
        // cb(new Error('File must be a PDF!'))
        // cb(undefined, true) // upload should be expected
        // cb(undefined, false) // upload should not be expected
    }
})

const server = new express.Router()

// ----------------------- GET SECTION ------------------------------------------

// adding auth middleware function the following code will be run only if the auth function will use next()!
// server.get('/users', auth, async (req,res) => {

//     // ASYNC - AWAIT APPROACH
//     try {
//         const users = await User.find({})  
//         console.log(chalk.green('Users correctly readed!\n') + chalk.gray(JSON.stringify(users)))
//         res.status(200).send(users)
//     } catch (error) {
//         console.log(chalk.red('Unable to read users!'))
//         res.status(500).send(error)
//     }
    
//     // PORMISE APPROACH    
//     // User.find({}).then((result) =>{
//     //     console.log(chalk.green('Users correctly readed!'))
//     //     res.status(200).send(result)
//     // }).catch((error)=>{
//     //     console.log(chalk.red('Unable to read users!'))
//     //     res.status(400).send(error)
//     // })
// })

server.get('/users/me', auth, async (req,res) => {

    // ASYNC - AWAIT APPROACH
    try {
        const user = req.user
        console.log(chalk.green('User correctly readed!\n') + chalk.gray(JSON.stringify(user)))
        res.status(200).send(user)
    } catch (error) {
        console.log(chalk.red('Unable to read user!'))
        res.status(500).send(error)
    }
    
    // PORMISE APPROACH    
    // User.find({}).then((result) =>{
    //     console.log(chalk.green('Users correctly readed!'))
    //     res.status(200).send(result)
    // }).catch((error)=>{
    //     console.log(chalk.red('Unable to read users!'))
    //     res.status(400).send(error)
    // })
})

// we don't need it anymore!
// route parameter => :id
// server.get('/users/:id', async (req,res) => {
//     // console.log(req.params)
//     const _id = req.params.id

//     try {
//         const user = await User.findById(_id)
//         //console.log(user)

//         if (!user){
//             console.log(chalk.red('User not present!'))
//             return  res.status(404).send()
//         }
//         console.log(chalk.green('User correctly readed by ID!\n') + chalk.gray(JSON.stringify(user)))
//         res.status(200).send(user)
//     } catch (error) {
//         console.log(chalk.red('Unable to read user by ID!'))
//         res.status(400).send(error)
//     }

//     // PORMISE APPROACH 
//     // User.findById(_id).then((result) =>{
//     //     console.log(chalk.green('User correctly readed by ID!'))
//     //     res.status(200).send(result)
//     // }).catch((error)=>{
//     //     console.log(chalk.red('Unable to read user by ID!'))
//     //     res.status(400).send(error)
//     // })
// })

server.get('/users/:id/avatar', async (req,res) => {

    try {
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error('Unable to find the image!')
        }

        //to set an header
        res.set('Content-Type','image/png')
        res.status(200).send(user.avatar)
    } catch (error) {
        console.log(chalk.red('Unable to find the image!'))
        res.status(404).send(error)
    }
})

// ----------------------- POST SECTION ------------------------------------------

// must provide an authentication token!
server.post('/users/login', async (req,res) =>{

    try {
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        console.log(chalk.green('User ' + user.email + ' correctly logged in!'))
        res.status(200).send({user, token}) //,token //user.getPublicProfile()
    } catch (error) {
        console.log(chalk.red('Unable to login!'))
        console.log(chalk.red(error))
        res.status(400).send(error) // we care only about validation right now!
    }
})

server.post('/users/logout', auth, async (req,res) => {

    try {
        req.user.tokens = req.user.tokens.filter(( token ) =>  token.token != req.token )

        await req.user.save()

        console.log(chalk.green('User ' + req.user.email + ' correctly logged out!'))
        res.status(200).send('Successfully logged out!')
    } catch (error) {
        console.log(chalk.red('Unable to logout!'))
        console.log(chalk.red(error))
        res.status(500).send(error)
        
    }
})

// logout from all session
server.post('/users/logoutAll', auth, async (req,res) => {

    try {
        req.user.tokens = []

        await req.user.save()

        console.log(chalk.green('User ' + req.user.email + ' correctly logged out from all sessions!'))
        res.status(200).send('Successfully logged out from all sessions!!')
    } catch (error) {
        console.log(chalk.red('Unable to logout!'))
        console.log(chalk.red(error))
        res.status(500).send(error)
        
    }
})

// registration - signup
// express do not use the return value!
server.post('/users', async (req,res) => {
    console.log(chalk.gray(JSON.stringify(req.body)))

    // ASYNC - AWAIT APPROACH
    try {
        const user = new User(req.body)
        // console.log(user)

        const token = await user.generateAuthToken()
        // console.log(token)

        await user.save()

        emailer.sendWelcomeEmail(user.email, user.name)

        console.log(chalk.green('Users correctly saved!'))
        
        res.status(201).send({user,token})
    } catch (error) {
        console.log(chalk.red('Unable to save user!'))
        console.log(chalk.red(error))
        res.status(400).send(error) // we care only about validation right now!
    }
    
    // PORMISE APPROACH
    // user.save().then((result)=>{
    //     console.log(chalk.green('Users correctly saved!'))
    //     res.status(201).send(result)

    // }).catch((error)=>{
    //     console.log(chalk.red('Unable to save user!'))
    //     res.status(400).send(error)
    // })
})

server.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {

    const buffer = await sharp(req.file.buffer).png().resize({ 
        //width: 250, 
        height: 250}).toBuffer() // sharp is asyncronous

    // important! do not use the dest property!
    req.user.avatar = buffer
    await req.user.save()

    // to render the image
    // <img src="data:image/jpg;base64,BINARY_DATA">
    // alternatively
    // <img src="http:LINK_TO_IMAGE">
    res.status(200).send({message: 'image correctly uploaded!'})
}, (error,req, res, next) => { // to do not render an html page!
    res.status(400).send({error: error.message})
})

// ----------------------- PATCH SECTION ------------------------------------------

server.patch('/users/me', auth, async (req,res) => {
    
    // check if the properties that are changing are between those allowed to change! 
    const updates = Object.keys(req.body)
    const allowedUpdates = [ 'name', 'email', 'password', 'age']
    // const isValidUpdate = updates.every((update) => { // run the function for every item in the array
    //     return allowedUpdates.includes(update)
    // })
    // or equivalentely
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))

    //check if the operation is valid
    if (!isValidUpdate){
        return res.status(400).send({error: 'invalid update!'})
    }
    try {
        // actually we can access the user with:
        const user = req.user

        // if we use Middleware, the following line will by-pass it! we need to write the code in another manner!
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new : true, runValidators: true})    
        // const user = await User.findById(req.user._id)
        // updates.forEach((update) => { // this is a dynamic approach
        //     user[update] = req.body[update]
        // })
        // or equivalently
        updates.forEach((update) => user[update] = req.body[update])

        if (!user){
            console.log(chalk.red('User not present!'))
            return  res.status(404).send()
        }

        await user.save()
        console.log(chalk.green('User correctly updated by ID!\n') + chalk.gray(JSON.stringify(user)))
        res.status(200).send(user)
    } catch (error) {
        console.log(chalk.red('Unable to update user by ID!'))
        res.status(400).send(error) // we care only about validation right now!
    }
})

// ----------------------- DELETE SECTION ------------------------------------------

server.delete('/users/me', auth, async (req,res) => {

    try {
        // const user = await User.findByIdAndDelete(req.user._id)

        // if (!user){
        //     console.log(chalk.red('User not present!'))
        //     return  res.status(404).send()
        // }

        await req.user.remove()

        emailer.sendCancellationEmail(req.user.email, req.user.name)

        console.log(chalk.green('User correctly deleted!\n') + chalk.gray(JSON.stringify(req.user)))
        res.status(200).send(req.user)
    } catch (error) {
        console.log(chalk.red('Unable to delete user!'))
        res.status(400).send(error) // we care only about validation right now!
    }
})

server.delete('/users/me/avatar', auth, async (req,res) => {

    try {
        // const user = await User.findByIdAndDelete(req.user._id)

        // if (!user){
        //     console.log(chalk.red('User not present!'))
        //     return  res.status(404).send()
        // }

        req.user.avatar = undefined

        await req.user.save()

        console.log(chalk.green('User profile image correctly deleted!\n') + chalk.gray(JSON.stringify(req.user)))
        res.status(200).send(req.user)
    } catch (error) {
        console.log(chalk.red('Unable to delete user profile picture!'))
        res.status(400).send(error) // we care only about validation right now!
    }
})

// ----------------------- EXPORTS SECTION ------------------------------------------

module.exports = server