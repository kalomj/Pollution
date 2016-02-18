'use strict';

var mongoose = require('mongoose'),
    HourlyData = mongoose.model('HourlyData');


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
exports.interpolated_insert = function(db_jobs_array,key_obj,start_ix,direction) {

    var end_ix = start_ix + direction,
        start_hour = key_obj.unbounded[start_ix],
        end_hour = key_obj.unbounded[end_ix];

    //return early if there are no gaps to interpolate (hours are consecutive integers)
    if(Math.abs(end_hour - start_hour)===1) {
        return;
    }

    //generator function to create bounded update jobs (updates bounded field to 1 for the given hour code)
    var bounded_fun = function(hour_code) {
        return function(cb){
            HourlyData.update({ measurement_key : key_obj.key, hour_code: hour_code },{ bounded : 1},{},function(err) {
                //async callback
                cb();
            });
        };
    };

    /*
    key_obj.aqsid
    key_obj.sitename
    key_obj.gmt_offset
    key_obj.parameter_name
    key_obj.reporting_units
    key_obj.latitude
    key_obj.longitude
    key_obj.country_code
    key_obj.data_source
    */

    /*

    Need function to reverse this calculation - convert an hour code back to a valid_date and valid_time string

     var valid_date = month + '/' + day + '/' + year;
     var valid_time = hour + ':00';

     //calculate monotonically increasing integer per hour since Midnight, January 1st, 2000
     var now = Date.UTC(year,month-1,day,hour);


     var hour_code = Math.abs((now.valueOf() - epoch.valueOf())/(60*60*1000));

     */

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

        return '00:' + String('00' + (hour_code % 24)).slice(-2);
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
                //async callback
                cb();
            });
        };
    };

    //add the update job first, otherwise a failure after this point could lead to a gap in the bounded core
    db_jobs_array.push(bounded_fun(start_ix));

    //then iterate through hours and push job to do time interpolation inserts
    var gap_size = Math.abs(end_hour - start_hour)-1;

    for(var i = 1; i <= gap_size; i += 1) {

        var current_hour = start_hour + i * direction;
        var interpolated_value = 0;

        db_jobs_array.push(insert_fun(current_hour,interpolated_value));
    }
};