const mongoose = require('mongoose');
const validator = require('validator');

// ======================================= Task Model =======================================
const taskSchema = new mongoose.Schema({
    description: { // validation, type and other stuffs
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, { // second argument
    timestamps: true //set to false by default!
})

// to do something before a specific event
// arguments: event name, function to run (normal and not arrow)
taskSchema.pre('save', async function(next){ // not arrow because we will loose the context
    
    const task = this // for more clarity but not mandatory
    
    console.log('just before saving task!')

    next() // if we don't call that the function will be blocked forever!
})

// taskSchema.post('save', async function(next){ // not arrow because we will loose the context
    
//     const task = this // for more clarity but not mandatory
    
//     console.log('just after saving task!')

//     next() // if we don't call that the function will be blocked forever!
// })

// ======================================= Task Model =======================================
const Task = mongoose.model('Task', taskSchema)

// TO CREATE

// const task = new Task({
//     description: 'Mongoose Tutorial'
// })

// TO SAVE

// task.save().then((result) =>{
//     console.log(result)
// }).catch((error)=>{
//     console.log(error)
// })

module.exports = Task