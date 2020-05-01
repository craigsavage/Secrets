// SETUP
const express = require('express'),
      app     = express();

const mongoose   = require('mongoose'),
      bodyParser = require('body-parser');

// Linking environment variables
require('dotenv').config();

// Connecting Mongo Database
const LOCAL_DB = `mongodb://localhost/${process.env.DB_NAME}`,
      ATLAS_DB = `mongodb+srv://${process.env.DB_LOGIN}:${process.env.DB_PASSWORD}@secrets-jxsb5.mongodb.net/${process.env.DB_NAME}`;

mongoose.connect(LOCAL_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

// Database Models
const User = require('./models/User');

// APP SETUP ~~
app.set('view engine', 'ejs');  // Let app use ejs
app.use(express.static('public'));  // Link static files

// parse application/x-www-form-urlencoded & application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Clear db for testing
// User.deleteMany({}, (err, result) => { console.log('Results:', result) });

// ROUTES ~~
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username }, (err, foundUser) => {
        if(err) { console.log(err) }
        else {
            if(password === foundUser.password) {
                res.render('secrets');
            } else {
                console.log('incorrect password');
            }
        }
    });
});

app.get('/register', (req, res) => {
    res.render('register');
});

// Registers new users to the database
app.post('/register', (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    })

    // Save the user to db then render the secret page
    newUser.save((err, user) => {
        if(!err) {
            res.render('secrets')
        } else {
            res.redirect('/')
        }
    });
});

// Connect to SERVER
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('Server started on port:', port);
});