'use strict';

/* jshint -W098 */
angular.module('mean.pollution').controller('PollutionController', ['$scope', 'Global', 'Pollution',
  function($scope, Global, Pollution) {
    $scope.global = Global;
    $scope.package = {
      name: 'pollution'
    };
  }
]).controller('LayerHeatmapCtrl', ['$scope', 'Global', 'Pollution', '$log', '$http',
  function($scope, Global, Pollution, $log, $http) {

    $scope.viewportData = [];

    var heatmap;

    $scope.$on('mapInitialized', function(event, map) {

      heatmap = map.heatmapLayers.foo;
      heatmap.set('radius',75);
      heatmap.set('maxIntensity',25);

      $scope.map = map;

      //set up event listeners - when the user stops browsing the map for a moment, rerender the pollution data
      google.maps.event.addListener //jshint ignore:line
        (map, 'idle', function() {

        var gridspacing = 50;

        var bounds = map.getBounds();

        //set lat to min lat
        var lat = bounds.Da.k;

        //while lat is less than max lat
        var latArray = [lat];

        //build array of latitude steps
        var latstep = (bounds.Da.j - bounds.Da.k)/(map.getDiv().clientHeight/gridspacing);
        while(lat < bounds.Da.j) {
          lat += latstep;
          latArray.push(lat);
        }

        //set lng to min lng
        var lng = bounds.va.j;

        //while lng is less than max lng
        var lngArray = [lng];

        //build array of longitude steps
        var lngstep = (bounds.va.k - bounds.va.j)/(map.getDiv().clientWidth/gridspacing);
        while(lng < bounds.va.k) {
          lng += lngstep;
          lngArray.push(lng);
        }

        //build grid of points to overlay on map

        var viewportQuery = { points: { coordinates: []}};
        for(var i = 0; i < latArray.length; i+=1){
          for(var j = 0; j < lngArray.length; j+=1) {
            viewportQuery.points.coordinates.push([latArray[i],lngArray[j]]);
          }
        }

        $http.post('/viewport', viewportQuery)
          .success(function(response) {
            $scope.viewportData = [];

            for(var i=0;i<response.points.coordinates.length;i+=1){

              var point = response.points.coordinates[i];

              $scope.viewportData.push({location: new google.maps.LatLng(Number(point[0]),Number(point[1])), weight: response.pm25[i]}); //jshint ignore:line

            }

            heatmap.set('data', $scope.viewportData);
          });


      });
    });

    $scope.toggleHeatmap= function(event) {
      heatmap.setMap(heatmap.getMap() ? null : $scope.map);
    };

    $scope.changeGradient = function() {
      var gradient = [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)'
      ];
      heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
    };

    $scope.changeRadius = function() {
      heatmap.set('radius', heatmap.get('radius')===75 ? 100 : 75);
    };

    $scope.changeOpacity = function() {
      heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
    };
  }
]);



