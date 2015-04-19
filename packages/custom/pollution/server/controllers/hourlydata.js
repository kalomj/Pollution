'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  HourlyData = mongoose.model('HourlyData');


/**
 * Return collection of hourly data measurements
 */
exports.show = function(req, res) {

  var year = req.params.year;
  var month = req.params.month;
  var day = req.params.day;
  var hour = req.params.hour;
  var parameter_name = req.params.parameter_name;

  var valid_date = month + '/' + day + '/' + year;
  var valid_time = hour + ':00';
  var country_code = 'US';
  var query_parameter_name = parameter_name === 'PM25' ? 'PM2.5' : parameter_name;

  var query = { valid_date: valid_date,
    valid_time: valid_time,
    country_code: country_code,
    parameter_name: query_parameter_name};

  HourlyData.find(query).exec(function(err, hourlydata) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot list the hourlydata'
      });
    }
    res.json(hourlydata);
  });
};