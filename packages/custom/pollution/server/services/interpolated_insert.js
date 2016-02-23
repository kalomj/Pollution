'use strict';

var mongoose = require('mongoose'),
    HourlyData = mongoose.model('HourlyData'),
    DelaunayJobs = mongoose.model('DelaunayJobs');


/**
 * add mongo update job for the starting index, then
 * add mongo insert jobs to the jobs array for point data that should be interpolated
 *
 * pass in a jobs array that may be prepopulated (push only into array)
 * pass in object with data related to the measurement key
 * pass in the starting index
 * pass in the direction  to insert interpolated values from the core
 * (insert jobs should be added to the db_jobs_array growing out from the core, either up or down)
 */
module.exports = function(db_jobs_array,key_obj,start_ix,direction) {

    var end_ix = start_ix + direction,
        start_hour = key_obj.unbounded[start_ix],
        end_hour = key_obj.unbounded[end_ix];

    //generator function to create bounded update jobs (updates bounded field to 1 for the given hour code)
    var bounded_fun = function(hour_code) {
        return function(cb){
            HourlyData.update(
                {
                    measurement_key : key_obj.key,
                    hour_code: hour_code
                },
                {
                    bounded:1
                },
                {

                },
                function(err) {
                    //async callback
                    cb();
            });
        };
    };

    var epoch = Date.UTC(2000,0,1,0);

    var hc_to_valid_date = function(hour_code) {
        var now =  new Date(hour_code*(60*60*1000) + epoch);
        var year = now.getUTCFullYear().toString().slice(-2);
        var month = String('00' + (now.getUTCMonth()+1)).slice(-2);
        var day = String('00' + (now.getUTCDate())).slice(-2);
        return month + '/' + day + '/' + year;
    };

    var hc_to_valid_time = function(hour_code) {
        //var now =  new Date(hour_code*(60*60*1000) + epoch.valueOf());
        //return '00:' + String('00' + now.getUTCHours()).slice(-2);

        return String('00' + (hour_code % 24)).slice(-2) + ':00';
    };

    //generator function to create interpolated insert jobs
    var insert_fun = function(hour_code,interpolated_value) {
        return function(cb) {
            HourlyData.create({
                measurement_key: key_obj.key,
                valid_date: hc_to_valid_date(hour_code),
                valid_time: hc_to_valid_time(hour_code),
                aqsid:  key_obj.aqsid,
                sitename: key_obj.sitename,
                gmt_offset: key_obj.gmt_offset,
                parameter_name: key_obj.parameter_name,
                reporting_units: key_obj.reporting_units,
                value: interpolated_value,
                latitude: key_obj.latitude,
                longitude: key_obj.longitude,
                country_code: key_obj.country_code,
                data_source: key_obj.data_source,
                hour_code: hour_code,
                interpolated: 1,
                bounded: 1
            },function(err,result) {
                if(err) {
                    console.log(err);
                }
                //async callback
                cb();
            });
        };
    };

    //generator function to set a given hour/parameter to dirty state (indicating triangulation needs to be recalculated)
    var dirty_fun = function(hour_code) {
        return function(cb) {
            DelaunayJobs.findOneAndUpdate(
                {
                    hour_code : hour_code,
                    parameter_name : key_obj.parameter_name
                },
                {
                    hour_code : hour_code,
                    parameter_name : key_obj.parameter_name,
                    valid_date : hc_to_valid_date(hour_code),
                    valid_time : hc_to_valid_time(hour_code),
                    dirty : 1
                },
                {
                    upsert:true
                },
                function(err,result) {
                    if(err) {
                        console.log(err);
                    }
                    //async callback
                    cb();
                }
            );
        };
    };

    //add the update job before inserts, otherwise a failure after this point could lead to a gap in the bounded core
    db_jobs_array.push(bounded_fun(start_hour));

    /*If the server were to die right after running to this part of the db_jobs_array
     * we could potentially flag an hour as bounded when it isn't
     * This will not affect the algorithms ability to recover when the server restarts. However,
     * There could be a permanent gap of data hours that does not have reduction method interpolation
     * applied (this only happens in this error case), and is expected to happen extremely rarely
     * The algorithms would still perform in this case with slight accuracy reductions.
     * an enhancement would be to schedule a job to scan the entire DB for gaps and repair them
     * perhaps as part of a maintenance or downtime routine
     * */

    //then iterate through hours and push job to do time interpolation inserts
    var gap_size = Math.abs(end_hour - start_hour)-1;

    //no inserts required, return early
    if(gap_size===0) {
        return;
    }

    //at least 1 insert required
    for(var i = 1; i <= gap_size; i += 1) {

        var current_hour = start_hour + i * direction;
        var interpolated_value = 0;

        var start_value = key_obj.unbounded_values[start_ix];
        var end_value = key_obj.unbounded_values[end_ix];

        var diff = end_value - start_value;
        var value_step = direction * diff / (end_hour-start_hour);
        interpolated_value = start_value + value_step * i;

        //db job to ensure triangulation is run later for this hour/parameter
        db_jobs_array.push(dirty_fun(current_hour));

        //db job to insert the interpolated value
        db_jobs_array.push(insert_fun(current_hour,interpolated_value));
    }
};