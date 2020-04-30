// SETUP
const express = require('express'),
      app     = express();

const bodyParser = require('body-parser');

// APP SETUP ~~
app.set('view engine', 'ejs');  // Let app use ejs
app.use(express.static('public'));  // Link static files

// parse application/x-www-form-urlencoded & application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// ROUTES ~~
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

// Connect to SERVER
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('Server started on port:', port);
});