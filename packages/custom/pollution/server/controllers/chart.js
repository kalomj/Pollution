'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Locations = mongoose.model('Locations'),
    HourlyData = mongoose.model('HourlyData');


/**
 * Find chart by id
 */
exports.chart = function(req, res, next, measurement_key) {
    HourlyData.find({
        measurement_key: measurement_key
    }).sort({hour_code : 1}).limit(24).exec(function(err, locations) {

        if (err) return next(err);
        if (!locations) return next(new Error('Failed to load location ' + measurement_key));
        req.chart = locations;

        next();
    });
};

/**
 * Show a chart
 * This call comes after the exports.chart
 * function in the chain, therefore chart is already known
 * Just pass it along
 */
exports.show = function(req, res) {
    res.json(req.chart);
};

/**
 * List of Charts
 */
exports.all = function(req, res) {
    Locations.find().sort('measurement_key').exec(function(err, charts) {
        if (err) {
            return res.status(500).json({
                error: 'Cannot list the charts'
            });
        }
        res.json(charts);

    });
};
