'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  MyRoute = mongoose.model('MyRoute'),
  interpolate = require('../services/interpolate');


/**
 * Find calculate delaunay triangulation for a given hour in time
 */
exports.render = function(req, res) {
  var myroute = new MyRoute(req.body);

  var year = req.params.year;
  var month = req.params.month;
  var day = req.params.day;
  var hour = req.params.hour;
  var parameter_name = req.params.parameter_name;

  interpolate.interpolate(myroute,year,month,day,hour,parameter_name,function() {
      res.json(myroute);
  });
};