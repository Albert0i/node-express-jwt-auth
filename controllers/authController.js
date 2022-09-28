require('dotenv').config()
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const maxAge = process.env.JWT_MAX_AGE || 60 * 60 * 24 * 3 // default 3 days 

// handle errors
const handleErrors = (err) => {
    //console.log('err.message=' + err.message)
    //console.log('err.code=' + err.code)
    let errors = { email: '', password: ''}

    // incorrect email
    if (err.message === 'incorrect email') {
        errors.email = 'that email is not registered'
    }
    // incorrect password
    if (err.message === 'incorrect password') {
        errors.password = 'that password is incorrect'
    }
    // duplicated error code 
    if (err.code === 11000) {
        errors.email = 'That email is already registered'
        return errors
    }
    // validation errors 
    if (err.message.includes('user validation failed'))
    {
        Object.values(err.errors).forEach(({properties}) => {
            //console.log(properties)
            errors[properties.path] = properties.message
        })
    }
    return errors
}

function createToken(id) {
    return jwt.sign({ id }, process.env.JWT_TOKEN_SECRET, { expiresIn: maxAge })
}

module.exports.signup_get = (req, res) => {
    res.render('signup')
}
module.exports.login_get = (req, res) => {
    res.render('login')
}
module.exports.signup_post = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.create({ email, password})
        const token = createToken(user._id)
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge })
        res.status(201).json({ user: user._id })
    }
    catch (err) {
        console.log(err)
        const errors = handleErrors(err)
        res.status(400).json({ errors })
    }
}
module.exports.login_post = async (req, res) => {
    const { email, password } = req.body
    
    try {
        const user = await User.login(email, password)
        const token = createToken(user._id)
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(200).json({ user: user._id })
    }
    catch (err) {
        console.log(err)
        const errors = handleErrors(err)
        res.status(400).json({ errors })
    }
}

module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1})
    res.redirect('/')
}