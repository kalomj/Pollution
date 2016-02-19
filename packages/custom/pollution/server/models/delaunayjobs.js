'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * DelaunayJobs Schema
 */
var DelaunayJobsSchema = new Schema({
    valid_date: {
        type: String
    },
    valid_time: {
        type: String
    },
    parameter : {
        type: String
    },
    dirty:{
        type:Number
    },
    hour_code:{
        type:Number
    }
});


mongoose.model('DelaunayJobs', DelaunayJobsSchema);