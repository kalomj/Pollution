'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  triangulate = require('delaunay-triangulate'),
  Triangle = mongoose.model('Triangle'),
  HourlyData = mongoose.model('HourlyData');


/**
 * Find calculate delaunay triangulation for a given hour in time
 */
exports.delaunay_cron = function(req, res) {
  var valid_date = '04/08/15';
  var valid_time = '21:00';
  var country_code = 'US';
  var parameter_name = 'PM2.5';

  HourlyData.find({ valid_date: valid_date,
                    valid_time: valid_time,
                    country_code: country_code,
                    parameter_name: parameter_name})
    .select('latitude longitude value')
    .exec(function (err,hourlydatas) {

      var points = [];

      if(err) {
        console.log(err);

        return res.status(500).json({
          error: 'Error querying data'
        });
      }

      hourlydatas.forEach(function(hourlydata){
        points.push([hourlydata.latitude, hourlydata.longitude]);
      });

      // Perform delaunay triangulation
      var triangles = triangulate(points);

      // Remove old delaunay triangulation wth the same metadata if it exists
      Triangle.remove({ valid_date: valid_date,
        valid_time: valid_time,
        country_code: country_code,
        parameter_name: parameter_name}, function(err) {
        console.log('triangle removed at %s %s %s', valid_date, valid_time, parameter_name);

        // populate the collection with the new triangulation
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
            country_code: country_code,
            parameter_name: parameter_name,
            values: [ hourlydatas[triangle[0]].value,
              hourlydatas[triangle[1]].value,
              hourlydatas[triangle[2]].value
            ]
          };

          var myTriangle = new Triangle(body);
          myTriangle.save(function(err) {
            if (err) {
              console.log(err);
            }
            console.log('Finished adding triangles to collection at %s %s %s', valid_date, valid_time, parameter_name);
          });
        });


      });
    });

  res.send('cron job successfully requested for ' + valid_date + ' ' + valid_time + ' ' + country_code + ' ' + parameter_name);
};