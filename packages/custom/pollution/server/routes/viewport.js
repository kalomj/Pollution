'use strict';

var viewport = require('../controllers/viewport');

module.exports = function(Pollution, app, auth) {

  app.route('/viewport')
    .post(viewport.render);
};