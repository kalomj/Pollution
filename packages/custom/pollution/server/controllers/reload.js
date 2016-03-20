'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  fs = require('fs'),
  LoadedFile = mongoose.model('LoadedFile'),
  _ = require('lodash'),
  exec = require('child_process').exec,
  cron = require('../services/cron'),
  async = require('async'),
  reduction = require('../services/reduction'),
  JobControl = mongoose.model('JobControl'),
    HourlyData = mongoose.model('HourlyData');


/**
 * Save collections of hourly data measurements if they are not already saved in the database
 */
exports.reload = function(req, res) {

  //first, query the JobControl collection to see if a job is currently running from another server
  //The findAndModify function available on MongoDB collection can find a job that is not running and set it to running
  //in one atomic operation
  JobControl.findOneAndUpdate({ job_name : 'reload', running : 0 }, { $set : { running : 1 } },function(err,result) {
    if(err) {
      console.log(err);
      res.json('Data load denied : ' + err);
    }
    else if(result) {
      res.json('Data load started ');

      LoadedFile.find().exec(function (err, loadedfile) {

        var loadedfiles = [];

        var existing = '9999999999.dat';

        if(loadedfile.length > 0) {
          for (var i = 0; i < loadedfile.length; i += 1) {
            loadedfiles.push(loadedfile[i].filename);
          }

          var mid = Math.floor(loadedfile.length / 2);

          existing = loadedfile[mid].filename;
        }

        var whoami = process.env.USER;

        var airnowpath = '/home/' + whoami + '/airnow';
        var hourlydatapath = airnowpath + '/hourlydata';
        var locationpath = airnowpath + '/locations';
        var joinedpath = airnowpath + '/joined';

        var availablefiles = fs.readdirSync(hourlydatapath);

        var filestoload = _.difference(availablefiles, loadedfiles);

        //sort so that files are processed from the boundaries of the core of loaded data outward
        var a = { before : [], after  : [], known : existing };  // data structure for the array split
        filestoload.forEach(
            function(elem,ix,array) {
                if (elem > this.known) {
                    this.after.push(elem);
                } else {
                    this.before.push(elem);
                }
            },a); // split array in half based on whether value is larger or smaller than existing data
        a.before.sort().reverse(); // sort data before existing data in descending order - process from known data into the past
        a.after.sort(); // sort data after existing data in ascending order - process from known data into the future

       filestoload = a.after.concat(a.before); // concatenate pre and post arrays. process as far as possible into the future first, then into the past




        var max_files = 5;
        var totaljobs = filestoload.length > max_files ? max_files * 6 : filestoload.length * 6;

        console.log('processing files split on ' + existing);
        //console.log(a);
        console.log(filestoload.slice(0,max_files));



          var savecb = function (filename) {
          return function (err) {
            if (err) {
              console.log(err);
            }
            console.log(filename + ' saved to database');
          };
        };

        var logcb = function(callback) {
          return function(message) {
            totaljobs -= 1;
            console.log(message + ' ' + totaljobs + ' remaining');
            callback();
          };
        };

        var cronSeries = function(year, month, day, hour, parameter_name) {
          return function(callback) {
            cron.delaunay_cron(year,month,day,hour,parameter_name,logcb(callback));
          };
        };

        var cronArray;

        //this runs once per file, so it's a good place to manage the Loaded Files collection
        var execcb = function (filename, callback) {
          return function (error, stdout, stderr) {
            console.log(error);
            console.log(stdout);
            console.log(stderr);

              var year = filename.substring(2, 4);
              var day = filename.substring(6, 8);
              var month = filename.substring(4, 6);
              var hour = filename.substring(8, 10);

              //calculate monotonically increasing integer per hour since Midnight, January 1st, 2000
              var now = Date.UTC(2000+Number(year),month-1,day,hour);
              var epoch = Date.UTC(2000,0,1,0);

              var hour_code = Math.abs((now - epoch)/(60*60*1000));

              var newLoadedFile = new LoadedFile({
                  filename: filename,
                  valid_date: month + '/' + day + '/' + year,
                  valid_time: hour + ':00',
                  hour_code: hour_code,
                  processed: 1
              });

              console.log(year + ' ' + month + ' ' + day + ' ' + hour);


              //delete all data that isn't our six parameters
              HourlyData.remove({ valid_date: month + '/' + day + '/' + year, valid_time: hour + ':00', parameter_name : { $nin: ['PM25', 'PM10', 'OZONE', 'NO2', 'SO2', 'CO'] }},function() {

                  cronArray = [];

                  //attempt to create triangulations for each parameter
                  var parameter_names = ['PM25', 'PM10', 'OZONE', 'NO2', 'SO2', 'CO'];
                  for(var j = 0; j < parameter_names.length; j+=1) {
                      cronArray.push(cronSeries(year, month, day, hour, parameter_names[j]));
                  }

                  //do all cron's in series then call the global callback
                  async.series(cronArray,function(err) {
                      newLoadedFile.save(savecb(filename));

                      /*LoadedFile.findOne({
                       filename: filename,
                       valid_date: month + '/' + day + '/' + year ,
                       valid_time: hour + ':00'
                       }, function(err,record) {
                       record.processed = 1;
                       record.save();
                       });*/
                      callback();
                  });
              });
          };
        };


        var funcSeries = function(i) {
          return function(callback) {
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
                    'awk \'BEGIN { FS="|";OFS=","} {print $1$2,$9,$10,$13,$2,"id" $1}\' ' + joinedpath + '/msl_' + filename + ' | sort  -t , -k1,1 > ' + joinedpath + '/temp_' + filename + ' && mv ' + joinedpath + '/temp_' + filename + ' ' + joinedpath + '/msl_' + filename + '\n' +
                      //sort and join the hourly data and the monitoring site files
                    'join -t, -1 1 -2 1 -o 1.1 1.2 1.3 1.4 1.5 1.6 1.7 1.8 1.9 2.2 2.3 2.4 1.10 ' + joinedpath + '/' + filename + ' ' + joinedpath + '/msl_' + filename + ' > ' + joinedpath + '/joined_' + filename + '\n' +
                      //use mongoimport to pull into the hourlydata collection
                    'mongoimport --db mean-dev --collection hourlydata --type csv --file ' + joinedpath + '/joined_' + filename + ' --fields measurement_key,valid_date,valid_time,aqsid,sitename,gmt_offset,parameter_name,reporting_units,value,latitude,longitude,country_code,data_source --upsert --upsertFields measurement_key,valid_date,valid_time' + '\n' +
                      //use mongoimport to pull into the locations collection
                    'mongoimport --db mean-dev --collection locations --type csv --file ' + joinedpath + '/msl_' + filename + ' --fields measurement_key,latitude,longitude,country_code,parameter_name,aqsid --upsert --upsertFields measurement_key' + '\n' +
                      //remove all temporary files to save space
                    'rm ' + joinedpath + '/' + filename + '\n' +
                    'rm ' + joinedpath + '/msl_' + filename + '\n' +
                    'rm ' + joinedpath + '/joined_' + filename + '\n' +
                    '\n'
                ;


            fs.writeFileSync(airnowpath + '/script_' + filename, script);
            fs.chmodSync(airnowpath + '/script_' + filename, '777');

            console.log('processing ' + airnowpath + '/script_' + filename);
            exec(airnowpath + '/script_' + filename, execcb(filename, callback));
          };
        };

        var funcArray = [];
        //don't process more than N at a time, to avoid crashing server instances with low memory. Assuming this
        //routine is scheduled every hour, it will eventually catch up to the available data, processing N days worth of data
        //per day until all historical data is captured in the database
        for (var k = 0; k < filestoload.length && k < max_files; k += 1) {
          funcArray.push(funcSeries(k));
        }


        console.log(funcArray.length);

        async.series(funcArray, function(err) {

          console.log('finished reload job');

          reduction.reduction(function(msg) {
            console.log(msg);
            JobControl.findOneAndUpdate({ job_name : 'reload', running : 1 }, { $set : { running : 0 } },function(err,result) {
              if(err) {
                console.log(err);
              }
              if(result) {
                console.log('Reload Job Set to Not Running');
              }
              else {
                console.log('JobControl Update Failed, check collection manually');
              }
            });
          });
        });
      });

    }
    else {
      res.json('Data load denied - job already running');
    }
  });
};