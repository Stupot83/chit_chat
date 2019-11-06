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

module.exports = routes;