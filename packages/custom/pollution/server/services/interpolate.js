'use strict';

var mongoose = require('mongoose'),
  Triangle = mongoose.model('Triangle');
  //HourlyData = mongoose.model('HourlyData'),
 // MyRoute = mongoose.model('MyRoute');

/**
 * Calculate the interpolated value of a point
 * assuming a delaunay mesh exists with known measurements
 */
exports.interpolate = function(myroute) {

  var points = myroute.points.coordinates;

  var handlequery =  function(i) {
    return function(err,triangle) {
      console.log(triangle[0].triangle.coordinates + ' ' + points[i]);
      //pull in barcentric library here - calculate coordinates then interpolate
    };
  };

  //find containing triangle for each point in the route
  for(var i = 0; i < 1; i+=1)
  {

    //swap latitude and longitude ordering for MongoDb spacial query
    var querypoint = {
      type: 'Point',
      coordinates: [
        points[i][1],
        points[i][0]
      ]
    };

    Triangle.where('triangle').intersects().geometry(querypoint)
      .exec(handlequery(i));
  }

  //calculate interpolated value at each point in the route

  //save interpolated values to the database
};