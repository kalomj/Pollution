'use strict';

angular.module('mean.pollution').controller('MyRoutesCtrl', ['$scope', '$stateParams', '$location', 'Global', 'MyRoutes','$state','XmlParser',
  function($parent, $scope, $stateParams, $location, Global, MyRoutes, $state, XmlParser) {
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


    $scope.findOne = function() {

      MyRoutes.get({
        myrouteId: $stateParams.myrouteId
      }, function(myroute) {
        $scope.myroute = myroute;

        /* jshint ignore:start */
        $parent.routeData = [];

        //set map center to the first point in the list
        $parent.centerlat = myroute.points.coordinates[0][0];
        $parent.centerlon = myroute.points.coordinates[0][1];

        for(var i=0;i<myroute.points.coordinates.length;i+=1){

          var point = myroute.points.coordinates[i];

          $parent.routeData.push(new google.maps.LatLng(Number(point[0]),Number(point[1])));

        }
        /* jshint ignore:end */
      });

    };
  }
]);
