const disabler = async ( req, res, next ) => {

if (req.method === 'GET'){

    res.send('GET requests are disabled!')
    } else {
    
        next()
    }
}

module.exports = disabler