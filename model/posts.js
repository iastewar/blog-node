var mongoose = require('mongoose');

var postSchema = new mongoose.Schema({
  title: {type: String, required: true},
  body: String,
  comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
  //comments: [{body: String, user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}}],
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

var commentSchema = new mongoose.Schema({
  body: String,
  post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

mongoose.model('Post', postSchema);
mongoose.model('Comment', commentSchema);
