'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Triangle = mongoose.model('Triangle');


/**
 * Return collection triangles
 */
exports.show = function(req, res) {

  var year = req.params.year;
  var month = req.params.month;
  var day = req.params.day;
  var hour = req.params.hour;
  var parameter_name = req.params.parameter_name;

  var valid_date = month + '/' + day + '/' + year;
  var valid_time = hour + ':00';
  var query_parameter_name = parameter_name === 'PM25' ? 'PM2.5' : parameter_name;

  var query = { valid_date: valid_date,
    valid_time: valid_time,
    parameter_name: query_parameter_name};

  Triangle.find(query).exec(function(err, triangles) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot list the triangles'
      });
    }
    res.json(triangles);
  });
};