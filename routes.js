const express = require('express');
const bcrypt = require('bcryptjs');
const routes = new express.Router();
const saltRounds = 10;
const User = require('./models/User');
const Following = require('./models/Following');
const Chit = require('./models/Chit');
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
  user.userName = form.userName;
  user.email = form.email;
  user.password_hash = passwordHash;

  if (form.password !== form.passwordConfirm) {
    res.render('create-account.html', {
      name: user.name,
      userName: user.userName,
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
    userName: form.userName,
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
          errorMessage: 'Password is incorrect'
        });
      }
    } else {

      res.render('sign-in.html', {
        errorMessage: 'No user with that email address or userName exists'
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
      user.userName = form.userName;
      user.email = form.email;
      user.password_hash = passwordHash;

      if (form.password !== form.passwordConfirm) {
        res.render('edit-account.html', {
          user: loggedInUser,
          name: user.name,
          userName: user.userName,
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

    var chitSearchObject = {
      userId: req.cookies.userId
    };

    DataAccess.deleteMany(Chit, chitSearchObject, res, next, () => {

      var followingSearchObject = {
        followingId: req.cookies.userId,
      };

      DataAccess.deleteMany(Following, followingSearchObject, res, next, () => {

        var followedSearchObject = {
          followerId: req.cookies.userId
        };

        DataAccess.deleteMany(Following, followedSearchObject, res, next, () => {
          res.clearCookie('userId');
          res.redirect('/sign-in');
        });
      });
    });
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

routes.get('/friends/:id/unfollow', (req, res, next) => {

  var searchObject = {
    _id: req.params.id
  };

  DataAccess.findOne(User, searchObject, res, next, (userFollowed) => {

    var unfollowSearchObject = {
      followingId: userFollowed.id,
      followerId: req.cookies.userId
    };

    DataAccess.deleteOne(Following, unfollowSearchObject, res, next, () => {
      res.redirect('/friends');
    });
  });
});

routes.get('/chits', (req, res, next) => {
  var userSearchObject = {
    _id: req.cookies.userId
  };

  DataAccess.findOne(User, userSearchObject, res, next, (loggedInUser) => {
    var chitSearchObject = {
      userId: req.cookies.userId
    };

    DataAccess.find(Chit, chitSearchObject, res, next, (chits) => {

      chits.sort((a, b) => {
        var updatedAtA = a.updatedAt;
        var updatedAtB = b.updatedAt;
        return (updatedAtB < updatedAtA) ? -1 : (updatedAtB > updatedAtA) ? 1 : 0;
      });

      res.render('chits.html', {
        user: loggedInUser,
        chits: chits
      });
    });
  });
});

routes.get('/chits/new', (req, res, next) => {
  var searchObject = {
    _id: req.cookies.userId
  };

  DataAccess.findOne(User, searchObject, res, next, (loggedInUser) => {



    res.render('create-chit.html', {
      user: loggedInUser
    });
  });
});

routes.post('/chits/new', (req, res, next) => {
  var form = req.body;
  var userId;
  var name;
  var userName;

  var searchObject = {
    _id: req.cookies.userId
  };

  DataAccess.findOne(User, searchObject, res, next, (loggedInUser) => {
    userId = loggedInUser._id;
    name = loggedInUser.name;
    userName = loggedInUser.userName;

    var chit = new Chit();
    chit.title = form.title;
    chit.text = form.text;
    chit.name = name;
    chit.userName = userName;
    chit.userId = userId;

    DataAccess.insertNew(chit, res, next, () => {
      res.redirect('/chits');
    }, err => {
      res.render('create-chit.html', {
        user: loggedInUser,
      });
    });
  });
});

routes.get('/chits/:id', (req, res, next) => {

  var userSearchObject = {
    _id: req.cookies.userId
  };

  DataAccess.findOne(User, userSearchObject, res, next, (loggedInUser) => {

    var chitSearchObject = {
      _id: req.params.id
    };

    DataAccess.findOne(Chit, chitSearchObject, res, next, (chit) => {

      res.render('edit-chit.html', {
        user: loggedInUser,
        chit: chit,
      });
    });
  });
});

routes.post('/chits/:id', (req, res, next) => {
  var form = req.body;

  var userSearchObject = {
    _id: req.cookies.userId
  };

  DataAccess.findOne(User, userSearchObject, res, next, (loggedInUser) => {

    var searchObject = {
      _id: req.params.id
    };

    DataAccess.findOneAndModify(Chit, searchObject, res, next, (chit) => {

      chit.title = form.title;
      chit.text = form.text;
      chit.updatedAt = Date.now();

      DataAccess.updateExisting(Chit, chit, res, next, () => {
        res.redirect('/chits');
      }, err => {
        res.render('edit-chit.html', {
          user: loggedInUser,
          chit: chit
        });
      });
    });
  });
});

routes.get('/chits/:id/delete', (req, res, next) => {

  var searchObject = {
    _id: req.params.id
  };

  DataAccess.deleteOne(Chit, searchObject, res, next, () => {
    res.redirect('/chits');
  });
});

routes.get('/feed', (req, res, next) => {

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

      userIdsToFind.push(req.cookies.userId);

      var usersFollowingSearchObject = {
        _id: {
          $in: userIdsToFind,
        }
      };

      DataAccess.find(User, usersFollowingSearchObject, res, next, (followedUsers) => {

        var arrayOfChits = [];

        followedUsers.forEach((followedUser) => {

          var usersFollowingChitsSearchObject = {
            userId: followedUser._id
          };

          DataAccess.find(Chit, usersFollowingChitsSearchObject, res, next, (userChits) => {

            userChits.forEach((userChit) => {
              arrayOfChits.push(userChit);
            });

              arrayOfChits.sort((a, b) => {
                var updatedAtA = a.updatedAt;
                var updatedAtB = b.updatedAt;
                return (updatedAtB < updatedAtA) ? -1 : (updatedAtB > updatedAtA) ? 1 : 0;
              });

              res.render('feed.html', {
                user: loggedInUser,
                arrayOfChits: arrayOfChits
              });
            });
        });
      });
    });
  });
});

module.exports = routes;