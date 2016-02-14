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

    //function generator for finding max bounded hour code associated with a key
   /*
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
    */

    //function generator for finding min bounded hour code associated with a key
    /*
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
    */

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
            HourlyData.find({ measurement_key:keyarray[i].key, bounded:1}).findOne(function (err, record) {

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
                //tasks.push(max_fun(i));
                tasks.push(bounded_fun(i));
                tasks.push(unbounded_fun(i));
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
                        //insert interpolated values between if necessary
                        //interpolate(keyarray[i],bottom_half_ix-1);
                        //interpolate(keyarray[i],bottom_half_ix);
                        //set central index to bounded
                        //set_bounded(keyarray[i],bottom_half_ix);
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