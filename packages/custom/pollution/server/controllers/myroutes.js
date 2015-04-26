'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  MyRoute = mongoose.model('MyRoute'),
  LoadedFile = mongoose.model('LoadedFile'),
  _ = require('lodash'),
  interpolate = require('../services/interpolate');


/**
 * Find myroute by id
 */
exports.myroute = function(req, res, next, id) {
  MyRoute.load(id, function(err, myroute) {
    if (err) return next(err);
    if (!myroute) return next(new Error('Failed to load myroute ' + id));
    req.myroute = myroute;
    next();
  });
};

/**
 * Create a myroute
 */
exports.create = function(req, res) {

  var myroute = new MyRoute(req.body);
  myroute.user = req.user;

  var count = 6;
  var interpcb = function () {
    return function() {
      count -= 1;

      console.log('here' + count);
      if (count === 0) {
        myroute.save(function (err) {
          if (err) {
            console.log(err);
            return res.status(500).json({
              error: 'Cannot save the route'
            });
          }

          res.json(myroute);

        });
      }
    };
  };

  var querycb = function(year,month,day,hour) {
    var parameter_names = ['PM25','PM10','SO2','CO','OZONE','NO2'];
    for(var i = 0; i < 6; i+=1) {
      interpolate.interpolate(myroute, year, month, day, hour, parameter_names[i], interpcb());
    }
  };

  //create valid date and valid_time from first point timestamp
  //"2014-06-05T23:39:51Z"

  var ts = myroute.timestamp[0] ? myroute.timestamp[0] : '9999-99-99T99:00:00Z';

  var year = ts.substring(2,4);
  var month = ts.substring(5,7);
  var day = ts.substring(8,10);
  var hour = ts.substring(11,13);

  myroute.valid_date = month + '/' + day + '/' + year;
  myroute.valid_time = hour + ':00';

  var filename = '20' + year + month + day + hour + '.dat';


  LoadedFile.findOne({ filename:filename}).exec(function(err,fn) {

    if(!fn) {

      LoadedFile.find({}).sort({filename : -1}).limit(1).exec(function(err,latestfn) {
        myroute.valid_date = latestfn[0].valid_date;
        myroute.valid_time = latestfn[0].valid_time;
        var year = myroute.valid_date.substring(6,8);
        var month = myroute.valid_date.substring(0,2);
        var day = myroute.valid_date.substring(3,5);
        var hour = myroute.valid_time.substring(0,2);
        querycb(year,month,day,hour);
      });
    }
    else {
      querycb(year,month,day,hour);
    }
  });
};

/**
 * Update a myroute - there is currently no way to call this from the website
 */
exports.update = function(req, res) {
  var myroute = req.myroute;


  myroute = _.extend(myroute, req.body);

  myroute.save(function(err) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot update the route'
      });
    }
    res.json(myroute);

  });
};

/**
 * Delete a myroute
 */
exports.destroy = function(req, res) {
  var myroute = req.myroute;

  myroute.remove(function(err) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot delete the myroute'
      });
    }
    res.json(myroute);

  });
};

/**
 * Show a myroute
 * This call comes after the exports.myroute
 * function in the chain, therefore myroute is already known
 * Just pass it along
 */
exports.show = function(req, res) {
  res.json(req.myroute);
};

/**
 * List of MyRoutes
 */
exports.all = function(req, res) {
  MyRoute.find().sort('-created').populate('user', 'name username').exec(function(err, myroutes) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot list the myroutes'
      });
    }
    res.json(myroutes);

  });
};
