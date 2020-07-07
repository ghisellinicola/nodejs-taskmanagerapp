// Mainetance suspension
const maintenance = async ( req, res, next ) => { 
    
    res.status(503).send('Website is under maintenance! Come back soon!')
    
}

module.exports = maintenance