var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'), //used to manipulate POST
    passport = require('passport'),
    flash = require('connect-flash'),
    session = require('express-session');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
}));

///// route middleware to make sure user is logged in
router.post('/', function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/users/login');
})

router.use('/new', function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.status = "unauthenticated";
  res.redirect('/users/login');
})

router.use('/:id/edit', function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/users/login');
})

router.use('/:post_id/comments', function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/users/login');
})

router.use('/:post_id/comments/:id/edit', function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/users/login');
})
/////




router.route('/')
  .get(function(req, res, next) {
    //retrieve all posts from Mongo
    mongoose.model('Post').find({}, function (err, posts) {
      if (err) {
        return console.error(err);
      } else {
        res.format({
          html: function() {
            res.render('posts/index.ejs', {
              posts: posts,
              user: req.user
            });
          },
          json: function() {
            res.json(infophotos);
          }
        });
      }
    });
  })

  .post(function(req, res) {
    var title = req.body.title;
    var body = req.body.body;
    var user = req.user;
    // call the create function for our database
    mongoose.model('Post').create({
      title : title,
      body : body,
      user : user
    }, function (err, post) {
      if (err) {
        res.send("There was a problem adding the information to the database");
      } else {
        // Post has been created
        console.log('POST creating new post: ' + post);

        user.posts.push(post);
        user.save();

        res.format({
          html: function() {
            res.location("posts");
            res.redirect("/posts");
          },
          json: function() {
            res.json(post);
          }
        });
      }
    })
  });

// GET New Post page.
router.get('/new', function(req, res) {
  res.render('posts/_new.ejs', {user: req.user});
});


// route middleware to validate :id
router.param('id', function(req, res, next, id) {
  // find the id in the database
  mongoose.model('Post').findById(id, function(err, post) {
    // respond with 404 if not Found
    if (err) {
      console.log(id + ' was not found');
      res.status(404);
      var err = new Error('Not Found');
      err.status = 404;
      res.format({
        html: function(){
          next(err);
        },
        json: function(){
          res.json({message: err.status + " " + err});
        }
      });
    } else {
      // validation done, save in req
      req.id = id;
      next();
    }
  });
});


var getComment = function(commentId) {
  mongoose.model('Comment').findById(commentId, function(err, comment) {
    if (err) {
      return console.error(err);
    } else {
      return comment;
    }
  })
}

router.route('/:id')
  .get(function(req, res) {
    mongoose.model('Post').findById(req.id, function(err, post) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        console.log('GET Retrieving ID: ' + post._id);
        mongoose.model('User').findById(post.user, function(err, author) {

          var commentObjs = [];
          var createCommentObjs = function(commentObjs, callback) {
            if (post.comments.length > 0) {
              post.comments.forEach(function(commentId, index) {
                mongoose.model('Comment').findById(commentId, function(err, comment) {
                  mongoose.model('User').findById(comment.user, function(err, user ) {
                    commentObjs.push([comment, user]);
                    if (index === post.comments.length - 1)
                      callback();
                  })
                })
              })
            } else {
              callback();
            }
          }

          createCommentObjs(commentObjs, function() {
            res.format({
              html: function(){
                res.render('posts/show.ejs', {
                  post: post,
                  user: req.user,
                  author: author,
                  comments: commentObjs
                });
              },
              json: function(){
                res.json(post);
              }
            });
          })


        })

      }
    });
  });

router.get('/:id/edit', function(req, res) {
  // search for the post within Mongo
  mongoose.model('Post').findById(req.id, function(err, post) {
    if (err) {
      console.log('GET Error: There was a problem retrieving: ' + err);
    } else {
      // return the post
      console.log("GET Retrieving ID: " + post._id);

      if (!post.user.equals(req.user._id))
        return res.redirect("/posts/" +  post._id);

      res.format({
        //HTML response renders the 'edit.jade' template
        html: function() {
          res.render('posts/edit.ejs', {
            post: post,
            user: req.user
          });
        },
        json: function(){
          res.json(post);
        }
      });
    }
  });
});

//PUT to update a post by ID
router.put('/:id/edit', function(req, res) {

    var title = req.body.title;
    var body = req.body.body;

        mongoose.model('Post').findById(req.id, function (err, post) {

            if (!post.user.equals(req.user._id))
              return res.redirect("/posts/" +  post._id);

            //update it
            post.update({
                title : title,
                body : body
            }, function (err, postID) {
              if (err) {
                  res.send("There was a problem updating the information to the database: " + err);
              }
              else {
                      //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                      res.format({
                          html: function(){
                               res.redirect("/posts/" + post._id);
                         },
                         //JSON responds showing the updated values
                        json: function(){
                               res.json(post);
                         }
                      });
               }
            })
        });
});

//DELETE a Post by ID
router.delete('/:id/edit', function (req, res){
    var user = req.user;
    //find post by ID
    mongoose.model('Post').findById(req.id, function (err, post) {
        if (err) {
            return console.error(err);
        } else {

            if (!post.user.equals(user._id))
              return res.redirect("/posts/" +  post._id);

            for (var i = 0; i < user.posts.length; i++) {
              if (user.posts[i].toString() === req.id) {
                user.posts.splice(i, 1);
                break;
              }
            }

            // dependent destroy
            for (var i = 0; i < post.comments.length; i++) {
              mongoose.model('Comment').findById(post.comments[i], function(err, comment) {
                comment.remove();
              });
            }

            //remove it from Mongo
            post.remove(function (err, post) {
                if (err) {
                    return console.error(err);
                } else {
                    //Returning success messages saying it was deleted
                    console.log('DELETE removing ID: ' + post._id);
                    res.format({
                        //HTML returns us back to the main page, or you can create a success page
                          html: function(){
                               res.redirect("/posts");
                         },
                         //JSON returns the item with the message that is has been deleted
                        json: function(){
                               res.json({message : 'deleted',
                                   item : post
                               });
                         }
                      });
                }
            });
        }
    });
});

// create a comment for a post
router.post('/:post_id/comments', function(req, res) {
    var body = req.body.body;
    var post_id = req.params.post_id;
    var user = req.user;

    // call the create function for our database
    mongoose.model('Post').findById(post_id, function (err, post) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        // Post has been created
        console.log('GET Retrieving ID: ' + post._id);

        mongoose.model('Comment').create({
          body: body,
          post: post,
          user: user
        }, function(err, comment) {
          if (err) {
            res.send("There was a problem adding the information to the database");
          } else {
            post.comments.push(comment);
            post.save();

            user.comments.push(comment);
            user.save();

            res.format({
              html: function() {
                //res.location("posts");
                res.redirect("/posts/" + post_id);
              },
              json: function() {
                res.json(post);
              }
            });
          }

        })


      }
    })
  });

// delete a comment for a post
router.delete('/:post_id/comments/:id/edit', function(req, res) {
  var post_id = req.params.post_id;
  var id  = req.params.id;
  var user = req.user;

  mongoose.model('Post').findById(post_id, function(err, post) {
    if (err) {
      return console.error(err);
    } else {

      mongoose.model('Comment').findOne({ '_id': id }, function(err, comment) {
        if (!(comment.user.equals(user._id) || post.user.equals(user._id)))
          return res.redirect("/posts/" + post_id);

        for (var i = 0; i < post.comments.length; i++) {
          if (post.comments[i].toString() === id) {
            post.comments.splice(i, 1);
            break;
          }
        }

        for (var i = 0; i < user.comments.length; i++) {
          if (user.comments[i].toString() === id) {
            user.comments.splice(i, 1);
            break;
          }
        }

        post.save();
        user.save();

        comment.remove(function(err, comment) {
          if (err) {
            return console.error(err);
          } else {
            res.format({
              html: function() {
                //res.location("posts");
                res.redirect("/posts/" + post_id);
              },
              json: function() {
                res.json(post);
              }
            });
          }
        })


      })


    }
  });
});

module.exports = router;
