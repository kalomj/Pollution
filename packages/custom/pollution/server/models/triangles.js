'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Triangles Schema
 */
var TriangleSchema = new Schema({
  triangle: {
    type: Schema.Types.Mixed
  },
  valid_date: {
    type: String
  },
  valid_time: {
    type: String
  },
  country_code : {
    type: String
  },
  parameter_name: {
    type: String
  },
  values: [Number]
});

/**
 * Indexes
 */
//TriangleSchema.index({triangle: '2dsphere'});


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
mongoose.model('Triangle', TriangleSchema);
