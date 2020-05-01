// SETUP
const express = require('express'),
    app = express();

const mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth20').Strategy;

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
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

// Google Passport Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
},
    function (accessToken, refreshToken, profile, cb) {
        console.log(profile)
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
));

// // Clear db for testing
// User.deleteMany({}, (err, result) => { console.log('Results:', result) });

// ROUTES ~~
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect to secrets.
        res.redirect('/secrets');
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
        if (err) { console.log(err) }
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
    User.register({ username: req.body.username }, req.body.password, (err, user) => {
        if (err) {
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
    User.find({'secret': {$ne: null}}, (err, foundUsers) => {
        if (err) { console.log(err); }
        else {
            if(foundUsers) {
                res.render('secrets', {usersWithSecrets: foundUsers})
            }
        }
    });
});

// Renders the secrets page to authenticated users
app.get('/submit', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('submit');
    } else {
        console.log('You need to login first');
        res.redirect('/login');
    }
});

// Renders the secrets page to authenticated users
app.post('/submit', (req, res) => {
    if (req.isAuthenticated()) {
        const submittedSecret = req.body.secret;

        User.findOne({ _id: req.user.id }, (err, foundUser) => {
            if(err) { console.log(err) }
            else {
                if(foundUser) {
                    foundUser.secret = submittedSecret;
                    foundUser.save(() => {
                        res.redirect('/secrets');
                    });
                }
            }
        })
    } else {
        console.log('You need to login first');
        res.redirect('/login');
    }
});

// Logout user and end their session
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// Connect to SERVER
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('Server started on port:', port);
});