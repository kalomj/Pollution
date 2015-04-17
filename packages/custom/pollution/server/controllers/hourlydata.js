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

  var valid_date = '04/08/15';
  var valid_time = '21:00';
  var country_code = 'US';
  var parameter_name = 'PM2.5';

  var query = { valid_date: valid_date,
    valid_time: valid_time,
    country_code: country_code,
    parameter_name: parameter_name};

  HourlyData.find(query).exec(function(err, hourlydata) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot list the hourlydata'
      });
    }
    res.json(hourlydata);
  });
};