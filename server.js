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
app.use(require('body-parser').json());
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

app.get('/',
    function (req, res) {
        let content = db.getAllContent();
        res.render('index', {user: req.user, content: content, readonly: true});
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

app.get('/signup',
    function (req, res) {
        res.render('signup');
    });

app.post('/signup',
    // passport.authenticate('local', {failureRedirect: '/signup'}),
    function (req, res) {
        db.CreateUser(req.body.username, req.body.displayName, req.body.password);
        res.redirect('login');
    });

app.post('/submit',
    require('connect-ensure-login').ensureLoggedIn(),
    function (req, res) {
        console.log("Body: ", req.body);
        db.addOrUpdateContent(req.user, req.body.contentType, req.body.contentInput, req.body.contentID);
        res.redirect('profile');
    });

app.post('/delete',
    require('connect-ensure-login').ensureLoggedIn(),
    function (req, res) {
        db.deleteContent(req.user, req.body.contentID);
        res.redirect('profile');
    });

app.get('/logout',
    function (req, res) {
        req.logout();
        res.redirect('/');
    });

app.get('/profile',
    require('connect-ensure-login').ensureLoggedIn(),
    function (req, res) {
        let content = db.getContentForUser(req.user);
        res.render('profile', {user: req.user, content: content, readonly: false});
    });

db.CreateUser('evan', 'pass');
app.listen(3000);
