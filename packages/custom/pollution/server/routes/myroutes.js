'use strict';

var myroutes = require('../controllers/myroutes');

// Article authorization helpers
var hasAuthorization = function(req, res, next) {
  if (!req.user.isAdmin && req.myroute.user.id !== req.user.id) {
    return res.status(401).send('User is not authorized');
  }
  next();
};

module.exports = function(Pollution, app, auth) {

  app.route('/myroutes')
    .get(myroutes.all)
    .post(auth.requiresLogin, myroutes.create);
  app.route('/myroutes/:myrouteId')
    .get(auth.isMongoId, myroutes.show)
    .put(auth.isMongoId, auth.requiresLogin, hasAuthorization, myroutes.update)
    .delete(auth.isMongoId, auth.requiresLogin, hasAuthorization, myroutes.destroy);

  // Finish with setting up the myrouteId param
  app.param('myrouteId', myroutes.myroute);
};
