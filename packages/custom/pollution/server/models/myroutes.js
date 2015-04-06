'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Points SubSchema
 */
var Points = new Schema({
  point: {
    type: [Number],
    required: true
  }
});

/**
 * Geometry SubSchema
 * Defines a GeoJSON compatible sub schema
 * in our myroute document
 */
var Geometry  = new Schema({
  'type': {
    type: String,
    required: true,
    enum: ['Point', 'LineString', 'Polygon', 'MultiPoint'],
    default: 'MultiPoint'
  },
  coordinates: {
    type: [Points],
    required: true
  }
});

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
    required: true,
    trim: true
  },
  timestamp: {
    type: [String],
    required: true,
    trim: true
  },
  points: {
    type: Geometry,
    required: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
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
