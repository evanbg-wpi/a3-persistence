const express = require('express');
const app = express();
const db = require('./dbManager');
const passport = require("passport");
const Strategy = require('passport-local').Strategy;

// const isProduction = process.env.NODE_ENV === 'production';

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(require('morgan')('combined'));
app.use(require('body-parser').urlencoded({extended: true}));
app.use(require('express-session')({secret: 'keyboard cat', resave: false, saveUninitialized: false}));

passport.use(new Strategy(
    function (username, password, cb) {
        db.getUser(username, function (err, user) {
            if (err) {
                return cb(err);
            }
            if (!user) {
                return cb(null, false);
            }
            if (user.password !== password) {
                return cb(null, false);
            }
            return cb(null, user);
        });
    }));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, cb) {
    cb(null, user.username);
});

passport.deserializeUser(function (username, cb) {
    db.getUser(username, function (err, user) {
        if (err)
            return cb(err);
        cb(null, user);
    });
});

// http://expressjs.com/en/starter/basic-routing.html
// app.get('/', function(request, response) {
//   response.sendFile(__dirname + '/views/index.ejs');
// });

app.get('/index', function (request, response) {
    response.sendFile(__dirname + '/views/index.ejs');
});

app.get('/',
    function (req, res) {
        res.render('index', {user: req.user});
    });

app.get('/login',
    function (req, res) {
        res.render('login');
    });

app.post('/login',
    passport.authenticate('local', {failureRedirect: '/login'}),
    function (req, res) {
        res.redirect('profile');
    });

app.post('/submit',
    require('connect-ensure-login').ensureLoggedIn(),
    function (req, res) {
        db.addContent(req.user, req.type, req.text);
        res.redirect('profile');
    });


app.get('/logout',
    function (req, res) {
        req.logout();
        res.render('index', {user: req.user});
    });

app.get('/profile',
    require('connect-ensure-login').ensureLoggedIn(),
    function (req, res) {
        let content = db.getContentForUser(req.user);
        console.log(content);
        res.render('profile', {user: req.user, content: content});
    });

app.listen(3000);
