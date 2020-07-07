const mongoose = require('mongoose');
const validator = require('validator');
const task = require('./task')

// hashing passwords
const bcryptjs = require('bcryptjs')
// web tokens
const jwt = require('jsonwebtoken');
const Task = require('./task');

// with mongoose middleware we can use some custom function before or after some events, 
// such as the validate event!

// ======================================= User Schema =======================================
// this user schema allows us to take advantage of middleware!
const userSchema = new mongoose.Schema({
    name: { // validation, type and other stuffs
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid!')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password cannot contain the word "password"!')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) { // custome validator
            if (value < 0 ) { // we want only positive ages
                throw new Error('Age must be a positive number!')
            }
        }
        // however is bettere to use a library for that! => NPM VALIDATOR!
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: { // profile image
        type: Buffer 
        // validation are taken care by multer
    }
    // tasks: [
    //     task: {
                    // WE WILL NOT USE THIS APPROACH!
    //     }
    // ]
}, { // second argument
    timestamps: true //set to false by default!
})

// we use mongoose to make the link between users and tasks!
userSchema.virtual('tasks', {
    ref: 'Task',
    'localField': '_id',
    'foreignField': 'owner'
})

// to do something before a specific event
// arguments: event name, function to run (normal and not arrow)
userSchema.pre('save', async function(next){ // not arrow because we will loose the context
    
    const user = this // for more clarity but not mandatory
    
    console.log('Hashing password just before saving user!')

    if(user.isModified('password')){
        user.password = await bcryptjs.hash(user.password,8)
    }

    next() // if we don't call that the function will be blocked forever!
})

// Delete user tasks wher user is removed!
userSchema.pre('remove', async function(next){ 

    const user = this

    await Task.deleteMany({owner: user._id})

    next()
})

// to do something after a specific event
// arguments: event name
// userSchema.post('save', async function(postnext){ // not arrow because we will loose the context
    
//     const user = this // for more clarity but not mandatory
    
//     console.log('just after saving!')

//     postnext() // if we don't call that the function will be blocked forever!
// })

// instance method
userSchema.methods.generateAuthToken = async function () {
    
    const user = this

    try {
        // console.log(process.env.JWT_SECRET)
        const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET)//, {expiresIn: '30 minutes'})

        user.tokens = user.tokens.concat({ token })

        await user.save()
        // console.log(token)

        return token

    } catch (error) {
        console.log(chalk.red('Is the JWT_SECRET correct?'))
        console.log(error)
    }
    
    // try {
    //      const data = jwt.verify(token, process.env.JWT_SECRET)
    //      console.log(data)
    // } catch (error) {
    //  console.log('The secret is wrong or has expired!')
    // }
}

// why toJSON works without being called?
// express when we call send it calls JSON.stringify behind the scenes!
// toJSON enable us to customize what we want to expose for each object!
userSchema.methods.toJSON = function () {
    const user = this

    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    
    return userObject
}

// userSchema.methods.getPublicProfile = function () {
//     const user = this

//     const userObject = user.toObject()

//     delete userObject.password
//     delete userObject.tokens

//     return userObject
// }

// class method
userSchema.statics.findByCredentials = async (email, password) =>{

    const user = await User.findOne({email})

    if (!user){
        throw new Error('Unable to login!')
    }

    const isMatch = await bcryptjs.compare(password,user.password)

    if(!isMatch){
        console.log('Passwords do not Match!')
        throw new Error('Unable to login!')
    } 
    
    console.log('Passwords Match!')
    return user
}

// ======================================= User Model =======================================

const User = mongoose.model('User', userSchema)

module.exports = User