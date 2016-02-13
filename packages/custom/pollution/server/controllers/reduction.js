'use strict';

/**
 * Module dependencies.
 */
var reduction = require('../services/reduction');


/**
 * do temporal reduction for missing measurements data
 *
 * each hourly data document in mongodb contains a flag to define if it is "bounded". records that are bounded
 * have a real measurement before and after that point in time. only records that are for an hour_code before the minimum
 * bounded record, or after the maximum bounded record, need to be considered for iterative reduction passes
 *
 * Since the database grows by progressively downloading historical data in addition to new data, unbounded records "grow"
 * outward from a bounded core. As soon as a measurement is found outside of the core, the unbounded gap is closed and no longer needs to be considered
 * in future passes
 */
exports.reduction = function(req, res) {

    var cb = function(message) {
        res.send(message);
    };

    reduction.reduction(cb);

};