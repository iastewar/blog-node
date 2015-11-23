var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var userSchema = new mongoose.Schema({
  email: {type: String, required: true},
  password: String,
  posts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
  comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}]
});

// generate hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

// check if password is valid
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
}

mongoose.model('User', userSchema);
