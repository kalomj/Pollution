'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  MyRoute = mongoose.model('MyRoute'),
  _ = require('lodash');


/**
 * Find myroute by id
 */
exports.myroute = function(req, res, next, id) {
  MyRoute.load(id, function(err, myroute) {
    if (err) return next(err);
    if (!myroute) return next(new Error('Failed to load myroute ' + id));
    req.myroute = myroute;
    next();
  });
};

/**
 * Create a myroute
 */
exports.create = function(req, res) {
  var myroute = new MyRoute(req.body);
  myroute.user = req.user;

  myroute.save(function(err) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot save the route'
      });
    }
    res.json(myroute);

  });
};

/**
 * Update a myroute
 */
exports.update = function(req, res) {
  var myroute = req.myroute;

  myroute = _.extend(myroute, req.body);

  myroute.save(function(err) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot update the route'
      });
    }
    res.json(myroute);

  });
};

/**
 * Delete a myroute
 */
exports.destroy = function(req, res) {
  var myroute = req.myroute;

  myroute.remove(function(err) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot delete the myroute'
      });
    }
    res.json(myroute);

  });
};

/**
 * Show a myroute
 * This call comes after the exports.myroute
 * function in the chain, therefore myroute is already known
 * Just pass it along
 */
exports.show = function(req, res) {
  res.json(req.myroute);
};

/**
 * List of MyRoutes
 */
exports.all = function(req, res) {
  MyRoute.find().sort('-created').populate('user', 'name username').exec(function(err, myroutes) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot list the myroutes'
      });
    }
    res.json(myroutes);

  });
};
