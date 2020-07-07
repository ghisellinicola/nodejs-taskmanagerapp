const { JsonWebTokenError } = require("jsonwebtoken")

const jwt = require('jsonwebtoken')
const User = require('../model/user')

// but this is not enough! We need to hide the data of the others user!
const auth = async ( req, res, next ) => {

    try {
        
        const token = req.header('Authorization').replace('Bearer ','')

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        console.log(decoded)
        
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token })
        
        // not mandatory, but for save resources in future!
        req.token = token
        req.user = user

        if(!user){
            console.log({error: 'Please Authenticate.'})
            throw new Error()
        }

        next()
        
    } catch (error) {
        console.log(error)
        res.status(401).send( {error: 'Please Authenticate.'} )
    }
}

module.exports = auth