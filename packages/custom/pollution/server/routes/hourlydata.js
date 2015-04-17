'use strict';

var hourlydata = require('../controllers/hourlydata');

module.exports = function(Pollution, app, auth) {

  app.route('/hourlydata')
    .get(hourlydata.show);
};