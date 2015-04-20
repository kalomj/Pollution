'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * LoadedFiles Schema
 */
var LoadedFileSchema = new Schema({
  filename: {
    type: String
  },
  valid_date: {
    type: String
  },
  valid_time: {
    type: String
  },
  loaded : {
    type: Date,
    default: Date.now
  }
});


mongoose.model('LoadedFile', LoadedFileSchema);