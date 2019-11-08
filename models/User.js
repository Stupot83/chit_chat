const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  userName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  password_hash: {
    type: String,
    trim: true,
  },
});

userSchema.index({
  userName: 1,
  email: 1
}, {
  unique: true
});

module.exports = mongoose.model('User', userSchema);