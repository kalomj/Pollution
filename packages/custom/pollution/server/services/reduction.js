'use strict';

var mongoose = require('mongoose'),
    HourlyData = mongoose.model('HourlyData'),
    async = require('async');


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
exports.reduction = function(cb) {

    //don't wait in calling controller, return immediately
    cb('reduction job requested');

    //an array of javascript objects to hold the data
    var keyarray = [];

    //function generator for finding max bounded hour code associated with a key
    var max_fun = function(i) {
        return function(cb) {
            HourlyData.find({ measurement_key:keyarray[i].key, bounded:1}).sort({hour_code:-1}).limit(1).exec(function (err, record) {
                if (!record.length) {
                    keyarray[i].max_hour_code = -1;
                    keyarray[i].max_hour_value = -1;
                }
                else {
                    keyarray[i].max_hour_code = record[0].hour_code;
                    keyarray[i].max_hour_value = record[0].value;
                }

                //async callback
                cb();
            });
        };

    };

    //function generator for finding min bounded hour code associated with a key
    var min_fun = function(i) {
        return function(cb) {
            HourlyData.find({ measurement_key:keyarray[i].key, bounded:1}).sort({hour_code:1}).limit(1).exec(function (err, record) {
                if (!record.length) {
                    keyarray[i].min_hour_code = -1;
                    keyarray[i].min_hour_value = -1;
                }
                else {
                    keyarray[i].min_hour_code = record[0].hour_code;
                    keyarray[i].min_hour_value = record[0].value;
                }

                //async callback
                cb();
            });
        };

    };

    //function generator for finding unbounded hours based on a key
    var unbounded_fun = function(i) {
        return function(cb) {
            HourlyData.find({ measurement_key:keyarray[i].key, bounded:0}).sort({hour_code:1}).select('hour_code').exec(function (err, records) {

                if (!records.length) {
                    keyarray[i].unbounded = [];
                }
                else {
                    keyarray[i].unbounded = records;
                }

                //async callback
                cb();
            });
        };

    };

    //use async library to enforce serial execution of database calls
    async.series([
        //first get a list of all location/parameter combinations that exist in the measurement collection
        function(callback) {

            HourlyData.find({parameter_name:{$in:['PM25', 'PM10', 'OZONE', 'NO2', 'SO2', 'CO']}}).distinct('measurement_key', function (err, keys) {

                for (var i = 0; i < keys.length; i += 1) {
                    keyarray.push({key:keys[i]});
                }

                callback(null,'retrieved distinct measurement keys');
            });

        },
        // for each measurement key, get the maximum hour_code of a bounded record, minimum hour_code of a bounded record, and complete list of unbounded hour_codes
        function(callback) {

            var tasks = [];

            for (var i = 0; i < keyarray.length; i +=1 ) {
                tasks.push(max_fun(i));
                tasks.push(min_fun(i));
                tasks.push(unbounded_fun(i));
            }

            async.parallel(tasks, function(err,results) { callback(null,'retrieved distinct measurement keys'); });


        },
        // keyarray is populated with all necessary data. find gaps and interpolate new values for insert. set bounded flags as appropriate with update
        function(callback) {

            console.log(keyarray);

            callback(null,'values interpolated');
        }
    ],
    //cleanup
    function(err, results) {
        console.log('reduction job complete');

        if (err) {
            console.log(err);

            if (cb) {
                cb(err);
            }

        }
    });
};