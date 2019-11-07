const express = require('express');
const bcrypt = require('bcryptjs');
const routes = new express.Router();
const saltRounds = 10;
const User = require('./models/User');
const Following = require('./models/Following');
const DataAccess = require('./dataAccess/dataAccess');

routes.get('/', (req, res) => {
  if (req.cookies.userId) {
    res.redirect('/user');
  } else {
    res.redirect('/sign-in');
  }
});

routes.get('/create-account', (req, res) => {
  res.render('create-account.html');
});

routes.post('/create-account', (req, res, next) => {
  var form = req.body;
  var passwordHash = bcrypt.hashSync(form.password, saltRounds);
  var user = new User();
  user.name = form.name;
  user.email = form.email;
  user.password_hash = passwordHash;

  if (form.password !== form.passwordConfirm) {
    res.render('create-account.html', {
      name: user.name,
      email: user.email,
      errorMessage: 'Password does not match'
    });
  } else {
    DataAccess.insertNew(user, res, next, (data) => {
      res.cookie('userId', data.id);
      res.redirect('/user');
    }, err => {
      res.render('create-account.html', {
        errorMessage: 'User already exists'
      });
    });
  }
});

routes.get('/sign-in', (req, res) => {
  res.render('sign-in.html');
});

routes.post('/sign-in', (req, res, next) => {
  var form = req.body;

  var searchObject = {
    email: form.email
  };

  DataAccess.findOne(User, searchObject, res, next, (user) => {

    if (user) {
      console.log({
        form,
        user
      });
      if (bcrypt.compareSync(form.password, user.password_hash)) {
        res.cookie('userId', user.id);
        res.redirect('/user');
      } else {

        res.render('sign-in.html', {
          errorMessage: 'Email address and password do not match'
        });
      }
    } else {

      res.render('sign-in.html', {
        errorMessage: 'No user with that email exists'
      });
    }
  });
});

routes.get('/sign-out', (req, res) => {

  res.clearCookie('userId');

  res.redirect('/sign-in');
});

routes.get('/user', (req, res, next) => {
  var userSearchObject = {
    _id: req.cookies.userId
  };

  DataAccess.findOne(User, userSearchObject, res, next, (loggedInUser) => {

    res.render('user.html', {
      user: loggedInUser,
    });
  });
});

routes.get('/edit-account', (req, res, next) => {
  var userSearchObject = {
    _id: req.cookies.userId
  };

  DataAccess.findOne(User, userSearchObject, res, next, (loggedInUser) => {

    res.render('edit-account.html', {
      user: loggedInUser,
    });
  });
});

routes.post('/edit-account', (req, res, next) => {

  var userSearchObject = {
    _id: req.cookies.userId
  };

  DataAccess.findOne(User, userSearchObject, res, next, (loggedInUser) => {

    var searchObject = {
      _id: req.cookies.userId
    };

    DataAccess.findOneAndModify(User, searchObject, res, next, (user) => {

      var form = req.body;
      var passwordHash = bcrypt.hashSync(form.password, saltRounds);

      user.name = form.name;
      user.email = form.email;
      user.password_hash = passwordHash;

      if (form.password !== form.passwordConfirm) {
        res.render('edit-account.html', {
          user: loggedInUser,
          name: user.name,
          email: user.email,
          errorMessage: 'Password does not match'
        });
      } else {

        DataAccess.updateExisting(User, user, res, next, () => {
          res.cookie('userId', user.id);
          res.redirect('/user');
        }, err => {
          res.render('edit-account.html', {
            user: loggedInUser,
            errorMessage: 'A user already exists with those details'
          });
        });
      }
    });
  });
});

routes.get('/delete-account', (req, res, next) => {

  var userSearchObject = {
    _id: req.cookies.userId
  };

  DataAccess.deleteOne(User, userSearchObject, res, next, () => {
    res.clearCookie('userId');
    res.redirect('/sign-in');
  });
});

routes.get('/members', (req, res, next) => {

  var userSearchObject = {
    _id: req.cookies.userId
  };

  DataAccess.findOne(User, userSearchObject, res, next, (loggedInUser) => {

    var followingSearchObject = {
      followerId: req.cookies.userId
    };

    DataAccess.find(Following, followingSearchObject, res, next, (peopleUserIsFollowing) => {

      var userIdsToFind = [];

      peopleUserIsFollowing.forEach((person) => {
        userIdsToFind.push(person.followingId);
      });

      var usersFollowingSearchObject = {
        _id: {
          $ne: req.cookies.userId,
          $nin: userIdsToFind
        }
      };

      DataAccess.find(User, usersFollowingSearchObject, res, next, (members) => {

        var followedAlreadySearchObject = {
          _id: {
            $in: userIdsToFind
          }
        };

        DataAccess.find(User, followedAlreadySearchObject, res, next, (following) => {

          members.sort((a, b) => {
            var nameA = a.name.toUpperCase();
            var nameB = b.name.toUpperCase();
            return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
          });

          following.sort((a, b) => {
            var nameA = a.name.toUpperCase();
            var nameB = b.name.toUpperCase();
            return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
          });

          res.render('members.html', {
            user: loggedInUser,
            members: members,
            following: following
          });
        });
      });
    });
  });
});

routes.get('/members/:id/follow', (req, res, next) => {

  var following = new Following();
  following.followingId = req.params.id;
  following.followerId = req.cookies.userId;

  DataAccess.insertNew(following, res, next, () => {
    res.redirect('/members');
  });
});

routes.get('/members/:id/unfollow', (req, res, next) => {

  var searchObject = {
    _id: req.params.id
  };

  DataAccess.findOne(User, searchObject, res, next, (userFollowed) => {

    var unfollowSearchObject = {
      followingId: userFollowed.id,
      followerId: req.cookies.userId
    };

    DataAccess.deleteOne(Following, unfollowSearchObject, res, next, () => {
      res.redirect('/members');
    });
  });
});

routes.get('/friends', (req, res, next) => {

  var userSearchObject = {
    _id: req.cookies.userId
  };

  DataAccess.findOne(User, userSearchObject, res, next, (loggedInUser) => {

    var followingSearchObject = {
      followerId: req.cookies.userId
    };

    DataAccess.find(Following, followingSearchObject, res, next, (peopleUserIsFollowing) => {

      var userIdsToFind = [];

      peopleUserIsFollowing.forEach((person) => {
        userIdsToFind.push(person.followingId);
      });

      var usersFollowingSearchObject = {
        _id: {
          $in: userIdsToFind
        }
      };

      DataAccess.find(User, usersFollowingSearchObject, res, next, (following) => {

        var followedSearchObject = {
          followingId: req.cookies.userId
        };

        DataAccess.find(Following, followedSearchObject, res, next, (peopleFollowingUser) => {

          var followIdsToFind = [];

          peopleFollowingUser.forEach((follow) => {
            followIdsToFind.push(follow.followerId);
          });

          var followedUserSearchObject = {
            _id: {
              $in: followIdsToFind
            }
          };

          DataAccess.find(User, followedUserSearchObject, res, next, (followed) => {

            following.sort((a, b) => {
              var nameA = a.name.toUpperCase();
              var nameB = b.name.toUpperCase();
              return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
            });

            followed.sort((a, b) => {
              var nameA = a.name.toUpperCase();
              var nameB = b.name.toUpperCase();
              return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
            });

            res.render('friends.html', {
              user: loggedInUser,
              following: following,
              followed: followed
            });
          });
        });
      });
    });
  });
});

module.exports = routes;