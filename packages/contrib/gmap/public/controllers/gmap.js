'use strict';

angular.module('mean.gmap').controller('GmapController', ['$scope', 'Global', 'Gmap','$timeout',
  function($scope, Global, Gmap,$timeout) {
    $scope.global = Global;
    $scope.package = {
      name: 'gmap'
    };

// map invocation
   $scope.mymap = {
    	center: { // Ness Zionna
        	latitude: 31.9333984 ,
        	longitude: 34.8086625
    	},
      dragging: false,
      refresh:true,
    	zoom: 10
	};

 $scope.mapinst = {
  events: {
    tilesloaded: function (map) {
      $scope.$apply(function () {
        $log.info('this is the map instance', map);
      });
    }
  }
  }
  // Couldn't figure out how panTo shuould work with angular-google-maps so mimicked
  // - an ugly replacement with $timeout.
  $scope.uglyPan = function (){
    console.log("uglyPan!");
    console.log($scope.newcenter);
    $scope.mymap.center = $scope.newcenter;
    $scope.mymap.zoom =10;
  }

  $scope.addMarker= function(location){
    var markerCoords = {
      latitude: location.k,
      longitude: location.B
    };

    $scope.markers.push({coords: markerCoords});
    $scope.mymap.zoom = 2;
    $scope.newcenter = markerCoords;
    $timeout($scope.uglyPan,500);
  }

// Multiple marker support
  	$scope.options = {scrollwheel: false};
  	$scope.markers = [{
            id:0,
            coords: { // Jerusalem
                latitude: 31.8615237,
                longitude: 35.1761319
            },
        },
        {
            id:1,
            coords: { // Bney Brak
                latitude: 32.0926177,
                longitude: 34.8392055
            },
            
        }
   	];
  }
]);


