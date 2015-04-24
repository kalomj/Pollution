'use strict';

/**
 * Module dependencies.
 */
var exec = require('child_process').exec,
  fs = require('fs');


/**
 * Save collections of hourly data measurements if they are not already saved in the database
 */
exports.filesync = function(req, res) {

  var whoami = process.env.USER;
  var airnowpath = '/home/' + whoami + '/airnow';
  var hourlydatapath = airnowpath + '/hourlydata';



  var execcb = function () {
    return function (error, stdout, stderr) {
      console.log(error);
      console.log(stdout);
      console.log(stderr);
      console.log('finished ftp mirror');

      var files = fs.readdirSync(hourlydatapath);

      //sort descending to get the most recent first
      files.sort().reverse();


      //delete the two most recent files since these will have fairly incomplete data
      fs.unlinkSync(hourlydatapath + '/' + files[0]);
      fs.unlinkSync(hourlydatapath + '/' + files[1]);
    };
  };


  exec(airnowpath + '/filesync', execcb());

  res.send('File Sync Requested');

};