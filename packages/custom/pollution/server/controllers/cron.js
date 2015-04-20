'use strict';

/**
 * Module dependencies.
 */
var cron = require('../services/cron');


/**
 * Find calculate delaunay triangulation for a given hour in time for a given parameter
 */
exports.delaunay_cron = function(req, res) {

  var year = req.params.year;
  var month = req.params.month;
  var day = req.params.day;
  var hour = req.params.hour;
  var parameter_name = req.params.parameter_name;

  var cb = function(message) {
    res.send(message);
  };

  cron.delaunay_cron(year,month,day,hour,parameter_name,cb);

};