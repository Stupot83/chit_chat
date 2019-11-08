const mongoose = require('mongoose');

const chitSchema = new mongoose.Schema({

  name: {
    type: String,
    trim: true
  },
  userName: {
    type: String,
    trim: true
  },
  title: {
    type: String,
    trim: true
  },
  text: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: String,
    trim: true
  }
});

chitSchema.index({
  userName: 1,
  createdAt: 1,
}, {
  unique: true
});

chitSchema.virtual('postedAt').get(function () {
  return this.createdAt.toUTCString().slice(0, -7);
});

chitSchema.virtual('ChangedAt').get(function () {
  return this.updatedAt.toUTCString().slice(0, -7);
});

module.exports = mongoose.model('Chit', chitSchema);