'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * HourlyData Schema
 */
var HourlyDataSchema = new Schema({
  measurement_key: {
    type: String
  },
  valid_date: {
    type: String
  },
  valid_time: {
    type: String
  },
  aqsid: {
    type: String
  },
  sitename: {
    type: String
  },
  gmt_offset: {
    type: Number
  },
  parameter_name: {
    type: String
  },
  reporting_units: {
    type: String
  },
  value: {
    type: Number
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  country_code: {
    type: String
  },
  data_source: {
    type: String
  },
  //an integer that is monotonically increasing to absolutely identify the hour the measurement was taken
  hour_code: {
    type: Number
  },
  //used as a flag to indicate if the value was read as a measurement or interpolated. 0 if not interpolated, 1 if interpolated
  interpolated: {
    type: Number
  },
  //used if a measurement needs to considered for reduction method interpolation. if a measurement (real or interpolated)
  // exists at hour_code+1 and hour_code-1, it becomes bounded and no longer needs to be considered in future reduction passes. 0 if not bounded, 1 if bounded
  bounded: {
    type: Number
  }
});

/**
 * Validations
 */
/*
 MyRouteSchema.path('title').validate(function(title) {
 return !!title;
 }, 'Title cannot be blank');

 MyRouteSchema.path('content').validate(function(content) {
 return !!content;
 }, 'Content cannot be blank');
 */

/**
 * Statics
 */
/*
MyRouteSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('user', 'name username').exec(cb);
};
*/
mongoose.model('HourlyData', HourlyDataSchema, 'hourlydata');
