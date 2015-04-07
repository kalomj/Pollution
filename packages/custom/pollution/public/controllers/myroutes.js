'use strict';

angular.module('mean.pollution').controller('MyRoutesCtrl', ['$scope', '$stateParams', '$location', 'Global', 'MyRoutes','$state','XmlParser',
  function($scope, $stateParams, $location, Global, MyRoutes, $state, XmlParser) {
    $scope.global = Global;

    $scope.hasAuthorization = function(myroute) {
      if (!myroute || !myroute.user) return false;
      return $scope.global.isAdmin || myroute.user._id === $scope.global.user._id;
    };

    /* jshint ignore:start */
    $scope.pretty = JSON.stringify(testRoute,null,'    ');
    /* jshint ignore:end */

    $scope.create = function(isValid) {

      //if (isValid) {
      var myroute
      /* jshint ignore:start */
         = new MyRoutes(testRoute)
      /* jshint ignore:end */
          ;
        myroute.$save(function(response) {
          $location.path('myroutes/' + response._id);
        });

      //} else {
      //  $scope.submitted = true;
      //}
    };

    $scope.uploadXml = function($fileContent){
      $scope.content = XmlParser.xml_str2json_str($fileContent);

      var json = XmlParser.xml_str2routejson($fileContent);

      var myroute = new MyRoutes(json)

        ;
      myroute.$save(function(response) {
        $location.path('myroutes/' + response._id);
      });
    };


    $scope.remove = function(myrouteId) {

      MyRoutes.get({
          myrouteId: myrouteId
        }, function(myroute) {
          $scope.myroute = myroute;

          if (myroute) {
            myroute.$remove(function(response) {
              for (var i in $scope.myroutes) {
                if ($scope.myroutes[i] === myroute) {
                  $scope.myroutes.splice(i,1);
                }
              }
              $state.reload();
            });
          } else {
            $scope.myroute.$remove(function(response) {
              $state.reload();
            });
          }
        });

    };

    $scope.update = function(isValid) {
      if (isValid) {
        var myroute = $scope.myroute;
        if(!myroute.updated) {
          myroute.updated = [];
        }
        myroute.updated.push(new Date().getTime());

        myroute.$update(function() {
          $location.path('myroutes/' + myroute._id);
        });
      } else {
        $scope.submitted = true;
      }
    };

    $scope.find = function() {
      MyRoutes.query(function(myroutes) {
        $scope.myroutes = myroutes;
      });
    };


    $scope.prepGmap = function() {
      var heatmap;

      $scope.$on('mapInitialized', function(event, map) {

        heatmap = map.heatmapLayers.foo;
        heatmap.set('radius',15);
        $scope.map = heatmap.getMap();
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
        heatmap.set('radius', heatmap.get('radius')===15 ? 25 : 15);
      };

      $scope.changeOpacity = function() {
        heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
      };
    };

    $scope.findOne = function() {
      $scope.dataHasLoaded = false;

      MyRoutes.get({
        myrouteId: $stateParams.myrouteId
      }, function(myroute) {
        $scope.myroute = myroute;

        /* jshint ignore:start */
        gmapPoints = [];

        //set map center to the first point in the list
        $scope.centerlat = myroute.points.coordinates[0][0];
        $scope.centerlon = myroute.points.coordinates[0][1];

        for(var i=0;i<myroute.points.coordinates.length;i+=1){

          var point = myroute.points.coordinates[i];

          gmapPoints.push(new google.maps.LatLng(Number(point[0]),Number(point[1])));

        }
        /* jshint ignore:end */

        $scope.dataHasLoaded = true;
      });

    };
  }
]);
