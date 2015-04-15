'use strict';

angular.module('mean.pollution')

  .factory('MyRoutes', ['$resource',
    function($resource) {
      return $resource('myroutes/:myrouteId', {
        myrouteId: '@_id'
      }, {
        update: {
          method: 'PUT'
        }
      });
    }
  ])
  .factory('XmlParser',
    function() {
      var xmlfactory = {};
      var x2js
          /* jshint ignore:start */
          = new X2JS()
          /* jshint ignore:end */
            ;
      xmlfactory.xml_str2json_str = function(file) {
        return JSON.stringify(x2js.xml_str2json(file),null,'    ');
      };

      xmlfactory.xml_str2routejson = function(file) {
        var tempjson = x2js.xml_str2json(file);

        var routejson = {};

        routejson.classifiedmode = [];
        routejson.timestamp = [];
        routejson.points = { type: 'MultiPoint', coordinates: [] };

        for(var i = 0;i < tempjson.gpx.trk.trkseg.length; i+=1) {
          var pt = tempjson.gpx.trk.trkseg[i];
          for(var j=0; j<pt.trkpt.length; j+=1) {
            routejson.classifiedmode.push('W');
            routejson.timestamp.push(pt.trkpt[j].time);
            routejson.points.coordinates.push([Number(pt.trkpt[j]._lat),Number(pt.trkpt[j]._lon)]);
          }
        }

        return routejson;
      };

      return xmlfactory;
    }
  );
