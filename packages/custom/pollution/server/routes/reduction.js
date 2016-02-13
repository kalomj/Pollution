'use strict';

var reduction = require('../controllers/reduction');

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

    app.route('/reduction')
        .get(reduction.reduction);

};