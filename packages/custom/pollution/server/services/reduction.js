'use strict';

var mongoose = require('mongoose'),
    HourlyData = mongoose.model('HourlyData'),
    Locations = mongoose.model('Locations'),
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

    //arrays to store mongodb insert and update jobs
    var db_jobs = [];

    //function generator for finding unbounded hours based on a key
    var unbounded_fun = function(i) {
        return function(cb) {
            HourlyData.find({ measurement_key:keyarray[i].key, bounded:0}).sort({hour_code:1}).select('hour_code value').exec(function (err, records) {

                if (!records.length) {
                    keyarray[i].unbounded_values = [];
                    keyarray[i].unbounded = [];
                }
                else {

                    keyarray[i].unbounded = [];
                    keyarray[i].unbounded_values = [];

                    for(var j = 0; j < records.length; j+=1) {

                        keyarray[i].unbounded[j] = records[j].hour_code;
                        keyarray[i].unbounded_values[j] = records[j].value;
                    }
                }
                if(i%400===0){
                    var pct = i/4000 * 100;
                    console.log( pct + '% complete with reduction function data collecting');
                }

                //async callback
                cb();
            });
        };

    };

    //function generator for finding any bounded hour based on a key
    var bounded_fun = function(i) {
        return function(cb) {
            HourlyData.findOne({ measurement_key:keyarray[i].key, bounded:1}, function (err, record) {

                if (record) {
                    keyarray[i].bounded_hour = record.hour_code;
                }
                else {

                    keyarray[i].bounded_hour = -1;

                }

                //async callback
                cb();
            });
        };
    };

    //function generator for finding common fields to be associated with each measurement key
    var common_fun = function(i) {
        return function(cb) {
            HourlyData.findOne({ measurement_key:keyarray[i].key}, function (err, record) {
                if(record) {
                    keyarray[i].aqsid = record.aqsid;
                    keyarray[i].sitename = record.sitename;
                    keyarray[i].gmt_offset = record.gmt_offset;
                    keyarray[i].parameter_name = record.parameter_name;
                    keyarray[i].reporting_units = record.reporting_units;
                    keyarray[i].latitude = record.latitude;
                    keyarray[i].longitude = record.longitude;
                    keyarray[i].country_code = record.country_code;
                    keyarray[i].data_source = record.data_source;
                    //async callback
                    cb();
                }
            });
        };
    };

    //function generator for printing status message after each batch of database jobs
    var db_status_fun = function(key, i) {
        return function() {
            console.log('finished database jobs for measurement key ' + key + ' # ' + i);
        };
    };

    //use async library to enforce serial execution of database calls
    async.series([
        //first get a list of all location/parameter combinations that exist in the measurement collection
        function(callback) {

            Locations.find({
                parameter_name: {
                    $in: ['PM25', 'PM10', 'OZONE', 'NO2', 'SO2', 'CO']
                }
            }).exec(function (err, keys) {

                for (var i = 0; i < keys.length; i += 1) {
                //for (var i = 0; i < 3; i += 1) {
                        keyarray.push({key:keys[i].measurement_key});
                        //initialize
                }
                console.log('retrieved distinct measurement keys');
                callback(null,'retrieved distinct measurement keys');
            });
        },
        // for each measurement key, get the maximum hour_code of a bounded record, minimum hour_code of a bounded record, and complete list of unbounded hour_codes
        function(callback) {

            var tasks = [];

            for (var i = 0; i < keyarray.length; i +=1 ) {
                tasks.push(bounded_fun(i));
                tasks.push(unbounded_fun(i));
                tasks.push(common_fun(i));
            }

            async.parallelLimit(tasks,100, function(err,results) {
                console.log('retrieved all key data');
                callback(null,'retrieved all key data');
            });
        },
        // keyarray is populated with all necessary data. find gaps and interpolate new values for insert. set bounded flags as appropriate with update
        function(callback) {
            var gap_total = 0;
            var update_total = 0;
            for (var i = 0; i < keyarray.length; i +=1 ) {
                //process unbounded hours array in two parts - increasing from the bounded core, and decreasing from the bounded core
                //if bounded_hour is -1, then arbitrarily split the array in half and process outwards
                var bottom_half_ix = -1;

                if(keyarray[i].bounded_hour === -1) {
                    //no bounded core was found, so create one if there are at least three entries
                    if(keyarray[i].unbounded.length < 3) {
                        //no way to create a bounded entry, so continue to next measurement key
                        continue;
                    }
                    else {
                        //get the central index (if length is the minimum of 3, the formula below will return 1 as expected
                        bottom_half_ix = Math.floor(keyarray[i].unbounded.length / 2);

                        //set central index to bounded
                        //bounded_update(keyarray[i],bottom_half_ix);

                        /*If the server were to die right here, we could potentially flag an hour as bounded when it isn't
                        * This will not affect the algorithms ability to recover when the server restarts. However,
                        * There could be a permanent gap of data hours that does not have reduction method interpolation
                        * applied (this only happens in this error case), and is expected to happen extremely rarely
                        * an enhancement would be to schedule a job to scan the entire DB for gaps and repair them
                        * perhaps as part of a maintenance or downtime routine */

                        //insert interpolated values between if necessary
                        //interpolated_insert(db_jobs,keyarray[i],bottom_half_ix,-1);
                        //interpolated_insert(db_jobs,keyarray[i],bottom_half_ix,1);


                    }
                }
                else {
                    for(var j = keyarray[i].unbounded.length-1; j <= 0; j-=1) {
                        if(keyarray[i].unbounded[j] < keyarray[i].bounded_hour || j===0) {
                            bottom_half_ix = j;
                            break;
                        }
                    }
                }

                var top_half_ix = bottom_half_ix + 1;
                var next = -1;

                //only perform interpolation if there is data gap
                if(bottom_half_ix > 0) {
                    next = bottom_half_ix - 1;
                    while(next >= 0) {
                        //console.log('bottom down hourend :'+keyarray[i].unbounded[bottom_half_ix]+' value:'+keyarray[i].unbounded_values[bottom_half_ix]);
                        //console.log('bottom down hourstart :'+keyarray[i].unbounded[next]+' value:'+keyarray[i].unbounded_values[next]);
                        if(keyarray[i].unbounded[bottom_half_ix]===keyarray[i].unbounded[next]+1) {
                            update_total += 1;
                        }
                        else {
                            update_total += 1;
                            gap_total += keyarray[i].unbounded[bottom_half_ix] - (keyarray[i].unbounded[next]+1);
                        }
                        bottom_half_ix -= 1;
                        next = bottom_half_ix - 1;
                    }
                }

                //only perform interpolation if there is data gap
                if(top_half_ix < keyarray[i].unbounded.length-1) {
                    next = top_half_ix + 1;
                    while(next < keyarray[i].unbounded.length) {
                        //console.log('top up hourstart :'+keyarray[i].unbounded[top_half_ix]+' value:'+keyarray[i].unbounded_values[top_half_ix]);
                        //console.log('top up hourend :'+keyarray[i].unbounded[next]+' value:'+keyarray[i].unbounded_values[next]);
                        if(keyarray[i].unbounded[top_half_ix]+1===keyarray[i].unbounded[next]) {
                            update_total += 1;
                        }
                        else {
                            update_total += 1;
                            gap_total += keyarray[i].unbounded[next] - (keyarray[i].unbounded[top_half_ix]+1);
                        }
                        top_half_ix += 1;
                        next = top_half_ix + 1;
                    }
                }

                //send database jobs using async series. As long as these jobs run in series, we can guarantee
                //that the reduction algorithm will pick up where it left off by expanding on the "core" of bounded
                //hours within each measurement key
                //we can run a separate "series" job for each measurement key since measurement keys are processed
                //independently
                //I can't think of a good reason to wait for the entire "series" job to complete before going to the next
                //measurement key. they can run in parallel. this will allow "series" jobs started early in the loop to
                //complete and fall out of active memory before we experience paging or thrashing
                async.series(db_jobs,db_status_fun(keyarray[i].key,i));

                //set db_jobs to a new, empty array for the next pass through the loop
                db_jobs = [];
            }

            console.log('gap total ' + gap_total + ' update total ' + update_total);
            console.log('values interpolated');

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