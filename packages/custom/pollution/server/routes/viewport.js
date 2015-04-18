'use strict';

var viewport = require('../controllers/viewport');

module.exports = function(Pollution, app, auth) {

  app.route('/viewport/:year/:month/:day/:hour/:parameter_name')
    .post(viewport.render);

};