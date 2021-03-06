'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * MyRoute Schema
 */
var MyRouteSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  classifiedmode: {
    type: [String],
    trim: true
  },
  timestamp: {
    type: [String],
    trim: true
  },
  points: {
    type: Schema.Types.Mixed
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  PM25: {
    type: [Number]
  },
  OZONE: {
    type: [Number]
  },
  CO: {
    type: [Number]
  },
  NO2: {
    type: [Number]
  },
  SO2: {
    type: [Number]
  },
  PM10: {
    type: [Number]
  },
  valid_date: {
    type: String
  },
  valid_time: {
    type: String
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
MyRouteSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('user', 'name username').exec(cb);
};

mongoose.model('MyRoute', MyRouteSchema);
