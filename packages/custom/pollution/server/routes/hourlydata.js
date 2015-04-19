'use strict';

var hourlydata = require('../controllers/hourlydata');

module.exports = function(Pollution, app, auth) {

  app.route('/hourlydata/:year/:month/:day/:hour/:parameter_name')
    .get(hourlydata.show);
};