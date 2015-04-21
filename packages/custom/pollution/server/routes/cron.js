'use strict';

var cron = require('../controllers/cron');

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

  app.route('/cron/:year/:month/:day/:hour/:parameter_name')
    .get(cron.delaunay_cron);

};