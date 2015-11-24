var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'), //used to manipulate POST
    passport = require('passport'),
    flash = require('connect-flash'),
    session = require('express-session');

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

router.get('/login', function(req, res) {
  res.status("unauthenticated");
  res.render('users/login.ejs', { message: req.flash('loginMessage'), user: req.user});
});

router.get('/signup', function(req, res) {
  res.render('users/signup.ejs', { message: req.flash('signupMessage'), user: req.user});
});

router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/',
  failureRedirect: '/users/signup',
  failureFlash: true
}));

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/',
  failureRedirect: '/users/login',
  failureFlash: true
}));

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

// route middleware to make sure user is logged in
var isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}

module.exports = router;
