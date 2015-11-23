var LocalStrategy = require('passport-local').Strategy;
//var User = require('../model/users');
var mongoose = require('mongoose'); // can get at the model using mongoose or the user file itself

var pass = function(passport) {
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
            password: ""
          }, function(err, user) {
            if (err) {
              throw err;
            } else {
              user.password = user.generateHash(password);
              user.save(function(err) {
                   if (err)
                       throw err;
                   return done(null, user);
               });
            }
          });
        }
      });
    });
  }));

  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, function(req, email, password, done) {
    mongoose.model('User').findOne({ 'email': email }, function(err, user) {
      if (err)
        return done(err);
      if (!user)
        return done(null, false, req.flash('loginMessage', 'Invalid Email!'));
      if (!user.validPassword(password))
        return done(null, false, req.flash('loginMessage', 'Invalid password!'));

      return done(null, user);
    });
  }));

}


module.exports = pass;
