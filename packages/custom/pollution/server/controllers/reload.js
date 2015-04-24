'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  fs = require('fs'),
  LoadedFile = mongoose.model('LoadedFile'),
  _ = require('lodash'),
  exec = require('child_process').exec,
  cron = require('../services/cron');


/**
 * Save collections of hourly data measurements if they are not already saved in the database
 */
exports.reload = function(req, res) {

  LoadedFile.find().exec(function (err, loadedfile) {

    var loadedfiles = [];
    for (var i = 0; i < loadedfile.length; i += 1) {
      loadedfiles.push(loadedfile[i].filename);
    }

    var whoami = process.env.USER;

    var airnowpath = '/home/' + whoami + '/airnow';
    var hourlydatapath = airnowpath + '/hourlydata';
    var locationpath = airnowpath + '/locations';
    var joinedpath = airnowpath + '/joined';

    var availablefiles = fs.readdirSync(hourlydatapath);

    var filestoload = _.difference(availablefiles, loadedfiles);

    //sort descending to get the most recent first
    filestoload.sort().reverse();

    var max_files = 5;
    var totaljobs = filestoload.length > max_files ? max_files * 6 : filestoload.length * 6;


    var savecb = function (filename) {
      return function (err) {
        if (err) {
          console.log(err);
        }
        console.log(filename + ' saved to database');
      };
    };

    var logcb = function() {
      return function(message) {
        totaljobs -= 1;
        console.log(message + ' ' + totaljobs + ' remaining');
      };
    };

    var execcb = function (filename) {
      return function (error, stdout, stderr) {
        console.log(error);
        console.log(stdout);
        console.log(stderr);

        var year = filename.substring(2, 4);
        var day = filename.substring(6, 8);
        var month = filename.substring(4, 6);
        var hour = filename.substring(8, 10);

        var newLoadedFile = new LoadedFile({
          filename: filename,
          valid_date: month + '/' + day + '/' + year ,
          valid_time: hour + ':00'
        });

        if (totaljobs === 0) {
          newLoadedFile.save(savecb(filename));
        }

        //attempt to create triangulations for each parameter
        var parameter_names = ['PM25', 'PM10', 'OZONE', 'NO2', 'SO2', 'CO'];
        for(var j = 0; j < parameter_names.length; j+=1) {
          cron.delaunay_cron(year,month,day,hour,parameter_names[j],logcb());
        }
      };
    };

    //don't process more than N at a time, to avoid crashing server instances with low memory. Assuming this
    //routine is scheduled every hour, it will eventually catch up to the available data, processing 10 days worth of data
    //per day until all historical data is captured in the database
    for (i = 0; i < filestoload.length && i < max_files; i += 1) {
      var filename = filestoload[i];

      var script =
        //replace commas with another character because mongoimport expects a 'dumb' csv file with commas that can't be escaped
          'sed \'s/,/./g\' ' + hourlydatapath + '/' + filename + ' > ' + joinedpath + '/' + filename + '\n' +
          'sed \'s/,/./g\' ' + locationpath + '/monitoring_site_locations.dat > ' + joinedpath + '/msl_' + filename + '\n' +
            //replace O3 with OZONE in the locations file so it can be joined with the hourly data
          'sed -i \'s/[|]O3[|]/|OZONE|/g\' ' + joinedpath + '/msl_' + filename + '\n' +
            //replace PM2.5 with PM25 because the dot causes all kinds of problems with javascript notations
          'sed -i \'s/[|]PM2.5[|]/|PM25|/g\' ' + joinedpath + '/msl_' + filename + '\n' +
          'sed -i \'s/[|]PM2.5[|]/|PM25|/g\' ' + joinedpath + '/' + filename + '\n' +
            //using awk to replace pipes with commas and reorder/concatenate columns
          'awk \'BEGIN { FS="|";OFS=","} {print $3$6,$1,$2,"id" $3,$4,$5,$6,$7,$8,$9}\' ' + joinedpath + '/' + filename + ' | sort -t , -k1,1 > ' + joinedpath + '/temp_' + filename + ' && mv ' + joinedpath + '/temp_' + filename + ' ' + joinedpath + '/' + filename + '\n' +
          'awk \'BEGIN { FS="|";OFS=","} {print $1$2,$9,$10,$13}\' ' + joinedpath + '/msl_' + filename + ' | sort  -t , -k1,1 > ' + joinedpath + '/temp_' + filename + ' && mv ' + joinedpath + '/temp_' + filename + ' ' + joinedpath + '/msl_' + filename + '\n' +
          //sort and join the hourly data and the monitoring site files
          'join -t, -1 1 -2 1 -o 1.1 1.2 1.3 1.4 1.5 1.6 1.7 1.8 1.9 2.2 2.3 2.4 1.10 ' + joinedpath + '/' + filename + ' ' + joinedpath + '/msl_' + filename + ' > ' + joinedpath + '/joined_' + filename + '\n' +
          //use mongoimport to pull into the hourlydata collection
          'mongoimport --db mean-dev --collection hourlydata --type csv --file ' + joinedpath + '/joined_' + filename + ' --fields measurement_key,valid_date,valid_time,aqsid,sitename,gmt_offset,parameter_name,reporting_units,value,latitude,longitude,country_code,data_source --upsert --upsertFields measurement_key,valid_date,valid_time' + '\n' +
          //remove all temporary files to save space
          'rm ' + joinedpath + '/' + filename + '\n' +
          'rm ' + joinedpath + '/msl_' + filename + '\n' +
          'rm ' + joinedpath + '/joined_' + filename + '\n' +
        '\n'
        ;


      fs.writeFileSync(airnowpath + '/script_' + filename, script);
      fs.chmodSync(airnowpath + '/script_' + filename, '777');

      exec(airnowpath + '/script_' + filename, execcb(filename));
    }
  });

  res.json('Data load requested');

};