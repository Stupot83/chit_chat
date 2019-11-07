const express = require('express');
const bcrypt = require('bcryptjs');
const routes = new express.Router();
const saltRounds = 10;
const User = require('./models/User');
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

module.exports = routes;