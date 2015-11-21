var mongoose = require('mongoose');

var postSchema = new mongoose.Schema({
  title: {type: String, required: true},
  body: String,
  //comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}]
  comments: [{body: String}]
});

// var commentSchema = new mongoose.Schema({
//   body: String
//   post_id: {type: String, required: true}
// });

mongoose.model('Post', postSchema);
//mongoose.model('Comment', commentSchema);
