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

  interpolate.interpolate(myroute,function() {
      res.json(myroute);
  });
};