var LocalStrategy = require('passport-local').Strategy;
//var User = require('../model/users');
var mongoose = require('mongoose'); // can get at the model using mongoose or the user file itself

var p = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    mongoose.model('User').findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, function(req, email, password, done) {

    // User.find won't fire unless data is sent back
    process.nextTick(function() {


      mongoose.model('User').findOne({ 'email': email }, function(err, user) {
        if (err)
          return done(err);

        if (user) {
          return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
        } else {
          mongoose.model('User').create({
            email: email,
            password: password
          }, function(err, user) {
            if (err) {
              throw err;
            } else {
              return done(null, user);
            }
          });
        }
      });
    });
  }));
}


module.exports = p;
