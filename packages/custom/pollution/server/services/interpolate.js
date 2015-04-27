'use strict';

var mongoose = require('mongoose'),
  Triangle = mongoose.model('Triangle'),
  async = require('async'),
  barycentric = require('barycentric');
  //HourlyData = mongoose.model('HourlyData'),
 // MyRoute = mongoose.model('MyRoute');

/**
 * Calculate the interpolated value of a point
 * assuming a delaunay mesh exists with known measurements
 */
exports.interpolate = function(myroute,year,month,day,hour,parameter_name,cb) {

  var points = myroute.points.coordinates;
  var asyncTasks = [];


  //setup location to store intepolated values
  myroute[parameter_name] = [];


  //setup callback to handle the mongodb query
  var querycb =  function(callback,i)  {
    return function(err,triangle) {
      if (err) {
        console.log(err);
      }

      if (triangle[0]) {
        var triangleArray = triangle[0].triangle.coordinates[0].slice(0, 3);
        var triangleValues = triangle[0].values;
        //pull in barcentric library here - calculate coordinates then interpolate
        var bcc = barycentric(triangleArray, [points[i][1], points[i][0]]);
        var interpolated_value = bcc[0] * triangleValues[0] + bcc[1] * triangleValues[1] + bcc[2] * triangleValues[2];

        myroute[parameter_name][i] = interpolated_value;

      }
      else {
        myroute[parameter_name][i] = 0;
      }


      //async callback
      callback();
    };
  };

  var buildquery = function(querypoint, i) {
    return function(callback) {
      Triangle
        .where('valid_date').equals(month + '/' + day + '/' + year)
        .where('valid_time').equals(hour + ':' + '00')
        .where('parameter_name').equals(parameter_name)
        .where('triangle').intersects().geometry(querypoint)
        .exec(querycb(callback,i));
    };
  };

  //find containing triangle for each point in the route
  for(var i = 0; i < points.length; i+=1)
  {

    //swap latitude and longitude ordering for MongoDb spacial query
    var querypoint = {
      type: 'Point',
      coordinates: [
        points[i][1],
        points[i][0]
      ]
    };

    asyncTasks.push(buildquery(querypoint,i));

  }

  //run all queries, then call the callback passed into exports.interpolate function
  async.parallel(asyncTasks,function() {
    //callback passed into function when tasks are complete
    cb();
  });

};