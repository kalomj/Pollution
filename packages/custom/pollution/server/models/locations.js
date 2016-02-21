'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Locations Schema
 */
var LocationsSchema = new Schema({
    measurement_key: {
        type: String
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
    parameter_name: {
        type: String
    },
    aqsid: {
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

mongoose.model('Locations', LocationsSchema);
