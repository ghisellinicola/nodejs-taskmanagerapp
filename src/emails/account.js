const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// DRAW BACK! IN THIS WAY MAIL ARE RECOGNIZED AS SPAM! WE SHOULD LINK A DOMAIN TO SOLVE THIS PROBLEM!

const sendWelcomeEmail = (email, name) => {
    sgMail.send({ // it is asynchronous!
        to: email,
        from: 'ghiselli.nicola@gmail.com',
        subject: 'Thank to joining in',
        text:  'Welcome to the app, ' + name + '. Let me know how you get along with the app!'
        //html: '' //to integrate images and other stuffs - fancy emails
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({ // it is asynchronous!
        to: email,
        from: 'ghiselli.nicola@gmail.com',
        subject: 'We are sad to see you leave us!',
        text:  'Goodbye ' + name + '. What happend? Could you leave us a brief feedback on your experience? Hoping to see you soon, have a nice day.'
        //html: '' //to integrate images and other stuffs - fancy emails
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}