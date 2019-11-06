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