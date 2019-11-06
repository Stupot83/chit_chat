const mongoose = require('mongoose');

module.exports.insertNew = (model, res, next, responseCallback, errorCallback) => {
    const callback = err => {
        if (err) {
            errorCallback(err);
        } else {
            responseCallback(model);
        }
    };
    model.save(callback);
};

module.exports.find = (model, searchObject, res, next, callback) => {
  model.find(searchObject, (err, data) => {
      if (err) {
          next(err);
      } else {
          callback(data);
      }
  });
};

module.exports.findOne = (model, searchObject, res, next, callback) => {
  model.findOne(searchObject, (err, data) => {
      if (err) {
          next(err);
      } else {
          callback(data);
      }
  });
};