'use strict';

var reload = require('../controllers/reload');

// Authorization helpers
/*
 var hasAuthorization = function(req, res, next) {
 if (!req.user.isAdmin && req.myroute.user.id !== req.user.id) {
 return res.status(401).send('User is not authorized');
 }
 next();
 };
 */

module.exports = function(Pollution, app, auth) {

  app.route('/reload')
    .get(reload.reload);

};