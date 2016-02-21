'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * JobControl Schema
 */
var JobControlSchema = new Schema({
    running : {
        type: Number
    },
    job_name : {
        type: String
    }
});


mongoose.model('JobControl', JobControlSchema, 'jobcontrol');