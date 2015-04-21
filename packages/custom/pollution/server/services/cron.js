'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  triangulate = require('delaunay-triangulate'),
  Triangle = mongoose.model('Triangle'),
  HourlyData = mongoose.model('HourlyData');


/**
 * Find calculate delaunay triangulation for a given hour in time for a given parameter
 */
exports.delaunay_cron = function(year,month,day,hour,parameter_name,cb) {

  var valid_date = month + '/' + day + '/' + year;
  var valid_time = hour + ':00';

  var query = { valid_date: valid_date,
    valid_time: valid_time,
    parameter_name: parameter_name};

  HourlyData.find(query)
    .select('latitude longitude value')
    .exec(function (err,hourlydatas) {

      var points = [];

      if(err) {
        console.log(err);

        if(cb) {
          cb(err);
        }

      }


      var hourlydatas_copy = [];
      for(var i = 0; i < hourlydatas.length; i+=1) {

        var hourlydata = hourlydatas[i];
        //exclude where latitude and longitude values are invalid
        if(hourlydata.latitude !== 0 && hourlydata.longitude !== 0) {
          points.push([hourlydata.latitude, hourlydata.longitude]);
          hourlydatas_copy.push(hourlydata);
        }
      }

      hourlydatas = hourlydatas_copy;

      console.log('Calculating triangulation');
      // Perform delaunay triangulation
      var triangles = triangulate(points);
      console.log('Finished calculating triangulation');

      // Remove old delaunay triangulation wth the same metadata if it exists
      Triangle.remove({ valid_date: valid_date,
        valid_time: valid_time,
        parameter_name: parameter_name}, function(err) {
        console.log('triangle removed at %s %s %s', valid_date, valid_time, parameter_name);

        // populate the collection with the new triangulation
        var triangle_bodys = [];
        triangles.forEach(function(triangle) {
          var body = {
            triangle: {
              type: 'Polygon',
              coordinates: [
                [
                  [points[triangle[0]][1], points[triangle[0]][0]],
                  [points[triangle[1]][1], points[triangle[1]][0]],
                  [points[triangle[2]][1], points[triangle[2]][0]],
                  [points[triangle[0]][1], points[triangle[0]][0]],
                ]
              ]
            },
            valid_date: valid_date,
            valid_time: valid_time,
            parameter_name: parameter_name,
            values: [ hourlydatas[triangle[0]].value,
              hourlydatas[triangle[1]].value,
              hourlydatas[triangle[2]].value
            ]
          };

          triangle_bodys.push(body);

        });
        Triangle.collection.insert(triangle_bodys,{},function(err) {
          if (err) {
            console.log(err);
            if(cb) {
              cb('Cron job failed: ' + err);
            }
          }
          else {
            console.log('finished bulk triangle insert');
            if(cb) {
              cb('cron job successfully completed for ' + valid_date + ' ' + valid_time + ' ' + parameter_name);
            }
          }

        });

      });
    });

  console.log('cron job requested for ' + valid_date + ' ' + valid_time + ' ' + parameter_name);
};