require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/authRoutes')
const { requireAuth, checkUser } = require('./middleware/authMiddleware')
const dbURI = process.env.MONGODB_URI
const port = process.env.SERVER_PORT || 3000

const app = express();

// middleware
app.use(express.static('public'));
app.use(express.urlencoded( {extended: true}))
app.use(express.json())
app.use(cookieParser())

// view engine
app.set('view engine', 'ejs');

// database connection
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((result) => { 
    console.log(`App is running on port ${port}`)
    app.listen(port) 
  })
  .catch((err) => console.log(err));

// routes
app.get('*', checkUser)
app.get('/', (req, res) => res.render('home'));
app.get('/smoothies', requireAuth, (req, res) => res.render('smoothies'));
app.use(authRoutes)


// // cookies
// app.get('/set-cookies', (req, res) => {
//   //res.setHeader('Set-Cookie', 'newUser=true')
//   res.cookie('newUser', false)
//   res.cookie('isEmployee', true, {
//     maxAge: 1000 * 60 * 60 * 24,
//     httpOnly: true
//   })
//   res.send('you got the cookies!')
// })
// app.get('/read-cookies', (req, res) => {
//   const cookies = req.cookies
//   console.log(cookies)
//   res.json(cookies)
// })
