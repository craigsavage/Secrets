// SETUP
const express = require('express'),
    app = express();

const mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    passport = require('passport'),
    passportLocal = require('passport-local');

// Linking environment variables
require('dotenv').config();

// APP SETUP ~~
app.set('view engine', 'ejs');  // Let app use ejs
app.use(express.static('public'));  // Link static files

// parse application/x-www-form-urlencoded & application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true }
}));
app.use(passport.initialize()); // Sets up passport for use
app.use(passport.session());    // Use passport to create sessions

// Connecting Mongo Database
const LOCAL_DB = `mongodb://localhost/${process.env.DB_NAME}`,
    ATLAS_DB = `mongodb+srv://${process.env.DB_LOGIN}:${process.env.DB_PASSWORD}@secrets-jxsb5.mongodb.net/${process.env.DB_NAME}`;

mongoose.connect(LOCAL_DB, {
    useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true
});

// Database Models
const User = require('./models/User');

// use static authentication strategy
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// // Clear db for testing
// User.deleteMany({}, (err, result) => { console.log('Results:', result) });

// ROUTES ~~
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, (err) => {
        if(err) { console.log(err) }
        else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets');
            });
        }
    });
});

app.get('/register', (req, res) => {
    res.render('register');
});

// Registers new users to the database
app.post('/register', (req, res) => {
    User.register({username: req.body.username}, req.body.password, (err, user) => {
        if(err) {
            console.log(err);
            res.redirect('/register');
        } else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets');
            });
        }
    });
});

// Renders the secrets page to authenticated users
app.get('/secrets', (req, res) => {
    if(req.isAuthenticated()) {
        res.render('secrets');
    } else {
        console.log('You need to login first');
        res.redirect('/login');
    } 
});

// Logout user
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// Connect to SERVER
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('Server started on port:', port);
});