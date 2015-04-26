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

    $scope.routeMarkers = [];
    $scope.routeData = [];

    //function to build a marker at a location that pops open a window with information
    $scope.createRouteMarker = function(lat, lng, info) {
      //jshint ignore:start
      var pos = new google.maps.LatLng(lat, lng);

      //build marker
      var marker = new google.maps.Marker({
        position: pos,
        map: $scope.map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: 'pink',
          fillOpacity: .7,
          scale: 5,
          strokeColor: 'black',
          strokeWeight: .5
        }
      });

      //build information window for marker
      var infowindow = new google.maps.InfoWindow({
        content: '<pre>' + JSON.stringify(info,null,2) + '</pre>'
        //content: info
      });

      //add click listener to marker to pop up information window
      google.maps.event.addListener(marker, 'click', function() {
        infowindow.open($scope.map,marker);
      });

      $scope.routeMarkers.push(marker);
      //jshint ignore:end
    };

    $scope.findOne = function(map) {

      $scope.map = map;

      MyRoutes.get({
        myrouteId: $stateParams.myrouteId
      }, function(myroute) {
        $scope.myroute = myroute;

        /* jshint ignore:start */
        $scope.routeData = [];

        //set map center to the first point in the list
        map.setZoom(16);
        map.panTo(new google.maps.LatLng(myroute.points.coordinates[0][0],myroute.points.coordinates[0][1]));


        for(var i=0;i<myroute.points.coordinates.length;i+=1){

          var point = myroute.points.coordinates[i];

          var info = {
            PM25:myroute.PM25[i],
            PM10:myroute.PM10[i],
            CO:myroute.CO[i],
            SO2:myroute.SO2[i],
            NO2:myroute.NO2[i],
            OZONE:myroute.OZONE[i]
          };

          $scope.createRouteMarker(Number(point[0]),Number(point[1]),info);

        }
        /* jshint ignore:end */
      });

    };


  }
]);
