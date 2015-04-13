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

  app.route('/cron')
    .get(cron.delaunay_cron);

  /*
  app.route('/myroutes')
    .get(myroutes.all)
    .post(auth.requiresLogin, myroutes.create);
  app.route('/myroutes/:myrouteId')
    .get(auth.isMongoId, myroutes.show)
    .put(auth.isMongoId, auth.requiresLogin, hasAuthorization, myroutes.update)
    .delete(auth.isMongoId, auth.requiresLogin, hasAuthorization, myroutes.destroy);
  */

  // Finish with setting up the param
  /*
  app.param('myrouteId', myroutes.myroute);
  */
};