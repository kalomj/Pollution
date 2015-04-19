'use strict';

var triangles = require('../controllers/triangles');

module.exports = function(Pollution, app, auth) {

  app.route('/triangles/:year/:month/:day/:hour/:parameter_name')
    .get(triangles.show);
};