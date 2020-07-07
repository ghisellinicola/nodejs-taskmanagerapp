const express = require('express')
const Task = require('../model/task')
const chalk = require('chalk')
const auth = require('../middleware/auth')

const server = new express.Router()

// ----------------------- GET SECTION ------------------------------------------

// tasks?completed=[true|false]
// tasks?limit10&skip=20 -> shows from 21 to 30!
// tasks?sortBy=createdAt:desc
// tasks?sortBy=createdAt&order=[ascending|descending]
server.get('/tasks', auth, async (req,res) => {

    const match = {}
    const sort = {}

    if (req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    
    // ASYNC - AWAIT APPROACH
    try {
        // const tasks = await Task.find({})

        console.log(req.user._id)

        // first approach 
        // const tasks = await Task.find({owner: req.user._id})
        // console.log(chalk.green('Tasks correctly readed!'))
        // res.status(200).send(tasks)

        // second approach
        // we are populating a virtual field!
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit), // if not present will be ignored!
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        console.log(req.user.tasks)

        console.log(chalk.green('Tasks correctly readed!'))
        res.status(200).send(req.user.tasks)
    } catch (error) {
        console.log(chalk.red('Unable to read tasks!'))
        res.status(500).send(error)
    }

    // PORMISE APPROACH
    // Task.find({}).then((result) =>{
    //     console.log(chalk.green('Tasks correctly readed!'))
    //     res.status(200).send(result)
    // }).catch((error)=>{
    //     console.log(chalk.red('Unable to read tasks!'))
    //     res.status(400).send(error)
    // })
})

server.get('/tasks/:id', auth, async (req,res) => {
    // console.log(req.params)
    const _id = req.params.id
    
    try {
        const task = await Task.findOne({_id, owner:req.user._id})
        // const task = await Task.findById(_id)

        if(!task){
            console.log(chalk.red('Task not present!'))
            return  res.status(404).send()
        }
        console.log(chalk.green('Task correctly readed by ID!'))
        res.status(200).send(task)
    } catch (error) {
        console.log(chalk.red('Unable to read task by ID!'))
        res.status(400).send(error)
    }

    // PORMISE APPROACH
    // Task.findById(_id).then((result) =>{
    //     console.log(chalk.green('Task correctly readed by ID!'))
    //     res.status(200).send(result)
    // }).catch((error)=>{
    //     console.log(chalk.red('Unable to read task by ID!'))
    //     res.status(400).send(error)
    // })
})

// ----------------------- POST SECTION ------------------------------------------

server.post('/tasks', auth, async (req,res) => {
    console.log(chalk.gray(JSON.stringify(req.body)))

    // the operator ... will copy everything from an object to a new object
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        console.log(chalk.green('Task correctly saved!'))
        res.status(201).send(task)
    } catch (error) {
        console.log(chalk.red('Unable to save task!'))
        res.status(400).send(error)
    }

    // PORMISE APPROACH
    // task.save().then((result)=>{
    //     console.log(chalk.green('Task correctly saved!'))
    //     res.status(201).send(result)

    // }).catch((error)=>{
    //     console.log(chalk.red('Unable to save task!'))
    //     res.status(400).send(error)
    // })
})

// ----------------------- PATCH SECTION ------------------------------------------

server.patch('/tasks/:id', auth, async (req,res) => {
    
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = [ 'description', 'completed']
    
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidUpdate){
        return res.status(400).send({error: 'invalid update!'})
    }

    try {
         // if we use Middleware, the following line will by-pass it! we need to write the code in another manner!
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new : true, runValidators: true})    

        // const task = await Task.findById(req.params.id)
        const task = await Task.findOne({_id, owner:req.user._id})
        updates.forEach((update) => task[update] = req.body[update])
       
        if (!task){
            console.log(chalk.red('Task not present!'))
            return res.status(404).send()
        }

        await task.save()
        console.log(chalk.green('Task correctly updated by ID!\n') + chalk.gray(JSON.stringify(task)))
        res.status(200).send(task)
    } catch (error) {
        console.log(chalk.red('Unable to update task by ID!'))
        res.status(400).send(error) // we care only about validation right now!
    }
})

// ----------------------- DELETE SECTION ------------------------------------------

server.delete('/tasks/:id', auth, async (req,res) => {

    const _id = req.params.id

    console.log('Trying to delete task: ' + _id)

    try {
        const task = await Task.findByIdAndDelete({_id, owner: req.user._id})

        if (!task){
            console.log(chalk.red('Task not present!'))
            return  res.status(404).send()
        }
        console.log(chalk.green('Task correctly deleted by ID!\n') + chalk.gray(JSON.stringify(task)))
        res.status(200).send(task)
    } catch (error) {
        console.log(chalk.red('Unable to delete task by ID!'))
        res.status(400).send(error) // we care only about validation right now!
    }
})

// ----------------------- EXPORTS SECTION ------------------------------------------

module.exports = server