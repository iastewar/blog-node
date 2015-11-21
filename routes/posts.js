var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST

router.use(bodyParser.urlencoded({ extended: true }));
router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
}));

router.route('/')
  .get(function(req, res, next) {
    //retrieve all posts from Mongo
    mongoose.model('Post').find({}, function (err, posts) {
      if (err) {
        return console.error(err);
      } else {
        res.format({
          html: function() {
            res.render('posts/index', {
              title: 'All Posts',
              "posts": posts
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
    // call the create function for our database
    mongoose.model('Post').create({
      title : title,
      body : body
    }, function (err, post) {
      if (err) {
        res.send("There was a problem adding the information to the database");
      } else {
        // Post has been created
        console.log('POST creating new post: ' + post);
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
  res.render('posts/new', {title: 'Add New Post'});
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

router.route('/:id')
  .get(function(req, res) {
    mongoose.model('Post').findById(req.id, function(err, post) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        console.log('GET Retrieving ID: ' + post._id);
        res.format({
          html: function(){
            res.render('posts/show', {
              "post": post,
              "comments": post.comments
            });
          },
          json: function(){
            res.json(post);
          }
        });
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

      res.format({
        //HTML response renders the 'edit.jade' template
        html: function() {
          res.render('posts/edit', {
            title: 'Post' + post._id,
            "post": post
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
    //find post by ID
    mongoose.model('Post').findById(req.id, function (err, post) {
        if (err) {
            return console.error(err);
        } else {
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

    // call the create function for our database
    mongoose.model('Post').findById(post_id, function (err, post) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        // Post has been created
        console.log('GET Retrieving ID: ' + post._id);

        post.comments.push({body : body});
        post.save();

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
  });

// delete a comment for a post
router.delete('/:post_id/comments/:id/edit', function(req, res) {
  var post_id = req.params.post_id;
  var id  = req.params.id;

  mongoose.model('Post').findById(post_id, function(err, post) {
    if (err) {
      return console.error(err);
    } else {
      for (var i = 0; i < post.comments.length; i++) {
        if (post.comments[i]._id == id) {
          post.comments.splice(i, 1);
          break;
        }
      }
      post.save();

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
  });
});

module.exports = router;
