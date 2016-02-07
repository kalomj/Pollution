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
  hour_code: {
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
