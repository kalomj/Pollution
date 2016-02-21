'use strict';

/* jshint -W098 */
angular.module('mean.pollution').controller('PollutionController', ['$scope', 'Global', 'Pollution',
  function($scope, Global, Pollution) {
    $scope.global = Global;
    $scope.package = {
      name: 'pollution'
    };
  }
]).controller('GMapCtrl', ['$scope', '$timeout', 'Global', 'Pollution', '$log', '$http',
  function($scope, $timeout, Global, Pollution, $log, $http) {

    $scope.routeViewLoad = function() {
      $scope.routeView = true;
    };

    $scope.mainViewLoad = function() {
      $scope.routeView = false;
    };

    //default center on the united states
    $scope.centerlat = 39.8282;
    $scope.centerlon = -98.5795;
    $scope.zoom = 5;

    $scope.viewportData = [];
    $scope.slider = {};
    $scope.userHeatmap = true;
    $scope.userTriangles = false;
    $scope.userMarkers = false;

    $scope.infoMarkerStatus = 'Not Displayed';
    $scope.triangleStatus = 'Not Displayed';
    $scope.heatmapStatus = 'Not Displayed';
    $scope.renderedTimeString = 'None';

    //datapicker functions

    $scope.open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.opened = true;
    };

    $scope.dateOptions = {
      formatYear: 'yy'
    };

    $scope.formats = ['MM/dd/yyyy', 'dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];

    //end datepicker functions

    $scope.parameter_name = 'CO';
    $scope.parameterMultiplier = {};
    $scope.parameterMultiplier.CO = 100;
    $scope.parameterMultiplier.PM25 = 1;
    $scope.parameterMultiplier.PM10 = 0.1;
    $scope.parameterMultiplier.SO2 = 5;
    $scope.parameterMultiplier.NO2 = 2;
    $scope.parameterMultiplier.OZONE = 0.5;

    $scope.slider.parameterMaxIntensity = {};

    $scope.slider.parameterMaxIntensity.PM25 = 141;
    $scope.slider.parameterMaxIntensity.CO = 2;
    $scope.slider.parameterMaxIntensity.PM10 = 400;
    $scope.slider.parameterMaxIntensity.SO2 = 23;
    $scope.slider.parameterMaxIntensity.NO2 = 37;
    $scope.slider.parameterMaxIntensity.OZONE = 125;

    $scope.triangles = [];
    $scope.markers = [];

    $scope.gridSpacing = 50;

    $scope.slider.radius = 82;
    $scope.slider.maxIntensity = $scope.slider.parameterMaxIntensity[$scope.parameter_name];

    $scope.updateDateTime = function (dt,time) {
      $scope.dt = dt;
      $scope.time = String('00' + time).slice(-2);

      var year = String($scope.dt.getYear()).slice(-2);
      var month = String('00' + ($scope.dt.getMonth()+1)).slice(-2);
      var day = String('00' + ($scope.dt.getDate())).slice(-2);
      var hour = $scope.time;//String('00' + $scope.time.getHours()).slice(-2);

      if($scope.checkDateTime(year,month,day,hour)) {
        $scope.year = year;
        $scope.month = month;
        $scope.day = day;
        $scope.hour = hour;
        $scope.renderMap();
      }
    };

    $scope.checkDateTime = function(year,month,day,hour) {
      var valid_date = month + '/' + day + '/' + year;
      var valid_time =  hour + ':00';

      for(var i = 0; i < $scope.datastats.files_collection.length; i+=1) {
        if($scope.datastats.files_collection[i].valid_date === valid_date && $scope.datastats.files_collection[i].valid_time === valid_time) {
          $scope.dtalert = null;
          return true;
        }
      }
      $scope.dtalert = valid_date + ' ' + valid_time + ' not available. Using ' + $scope.month + '/' + $scope.day + '/' + $scope.year + ' ' + $scope.hour + ':00';
      return false;
    };

    $scope.getDataStats = function () {
      $http.get('/loadedfiles').success(function (response) {
        $scope.datastats = response;
        $scope.dt = $scope.maxdate = new Date(response.max_valid_date);
        $scope.mindate = response.min_valid_date;

        $scope.time = $scope.datastats.max_valid_time.slice(0,2);

        //only set if not in route view
        if(!$scope.inRouteView) {
          $scope.year = String($scope.dt.getYear()).slice(-2);
          $scope.month = String('00' + ($scope.dt.getMonth() + 1)).slice(-2);
          $scope.day = String('00' + ($scope.dt.getDate())).slice(-2);
          $scope.hour = $scope.time;//String('00' + $scope.time.getHours()).slice(-2);
        }

        $scope.renderedTimeString = $scope.month + '/' + $scope.day + '/' + $scope.year + ' ' + $scope.hour + ':00';
      });
    };

    $scope.getDataStats();

    //Attempt to show the "true" max intensity in parameter units by considering ratio of overlap of heatmap markers
    $scope.slider.calculate = function() {
      var multiplier = $scope.gridSpacing < $scope.slider.radius ? $scope.gridSpacing / $scope.slider.radius : 1;

      $scope.slider.calculated = $scope.slider.maxIntensity * multiplier;
      $scope.slider.calculated = +(Math.round($scope.slider.calculated + 'e+2')  + 'e-2');
    };

    $scope.slider.calculate();

    var heatmap;

    //  return triangles of the delaunay triangluation for the given parameter
    $scope.renderTriangles = function(cb) {
      $scope.triangles = [];

      if(!$scope.userTriangles) {
        if(cb) {
          cb();
        }
        return;
      }

      $scope.triangleStatus = 'Requesting...';

      $http.get('/triangles/' + $scope.year + '/' + $scope.month + '/' + $scope.day + '/' + $scope.hour + '/' + $scope.parameter_name)
        .success(function (response) {
          $scope.triangleStatus = 'Success...';

          //clear old triangles before rendering new ones
          for (var i = 0; i < $scope.triangles.length; i+=1) {
            $scope.triangles[i].setMap(null);
          }
          $scope.triangles = [];

          for (i = 0; i < response.length; i += 1) {


            var triangleCoordinates = [
              //jshint ignore:start
              new google.maps.LatLng(response[i].triangle.coordinates[0][0][1], response[i].triangle.coordinates[0][0][0]),
              new google.maps.LatLng(response[i].triangle.coordinates[0][1][1], response[i].triangle.coordinates[0][1][0]),
              new google.maps.LatLng(response[i].triangle.coordinates[0][2][1], response[i].triangle.coordinates[0][2][0]),
              new google.maps.LatLng(response[i].triangle.coordinates[0][3][1], response[i].triangle.coordinates[0][3][0])
              //jshint ignore:end
            ];

            //jshint ignore:start
            $scope.triangles[i] = new google.maps.Polygon({
              paths: triangleCoordinates,
              strokeOpacity: 0.5,
              fillOpacity: 0,
              strokeWeight: 1
            });
            //jshint ignore:end
          }
          if(cb) {
            cb();
          }
        })
        .error(function(data,status) {
          $scope.triangleStatus = 'Error: ' + status;
          if(cb) {
            cb();
          }
        });
    };

    //function to build a marker at a location that pops open a window with information
    $scope.createMarker = function(lat, lng, info) {
      //jshint ignore:start
      var pos = new google.maps.LatLng(lat, lng);

      //set minumum and maximum values for marker size
      var scale = $scope.parameterMultiplier[$scope.parameter_name] * info.value;
      scale = scale > 75 ? 75 : scale;
      scale = scale < 7 ? 7 : scale;

      //select color
      var markercolor = 'blue';
      var fillOpacity = .2;
      if(info.interpolated ===1) {
        markercolor = 'red';
        fillOpacity = .4;
      }


      //build marker
      var marker = new google.maps.Marker({
        position: pos,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: markercolor,
          fillOpacity: fillOpacity,
          scale: scale,
          strokeColor: 'white',
          strokeWeight: .5
        }
      });

      //build information window for marker
      var infowindow = new google.maps.InfoWindow({
        //content: '<pre>' + JSON.stringify(info,null,2) + '</pre>'
        content: '<h4>' + info.value + ' ' + info.reporting_units + '</h4><p>Source: ' + info.data_source +
            '<p>24 Hour Trend: ' + '<a href=\'#!/chart/' + info.measurement_key + '\'>' + '#!/chart/' + info.measurement_key + '</a>'
      });

      //add click listener to marker to pop up information window
      google.maps.event.addListener(marker, 'click', function() {
        infowindow.open($scope.map,marker);
      });

      $scope.markers.push(marker);
      //jshint ignore:end
    };

    $scope.renderMarkers = function(cb) {
      $scope.markers = [];

      if(!$scope.userMarkers) {
        if(cb) {
          cb();
        }
        return;
      }

      $scope.infoMarkerStatus = 'Requesting...';

      //post to set up map markers to display measurement data info
      $http.get('/hourlydata/' + $scope.year + '/' + $scope.month + '/' + $scope.day + '/' + $scope.hour + '/' + $scope.parameter_name)
        .success(function(response) {
          $scope.infoMarkerStatus = 'Success...';

          //clear old markers before setting new ones
          for (var i = 0; i < $scope.markers.length; i += 1) {
            $scope.markers[i].setMap(null);
          }
          $scope.markers = [];

          for(i=0;i<response.length; i+=1) {
            $scope.createMarker(response[i].latitude, response[i].longitude, response[i] );
          }
          if(cb) {
            cb();
          }
        })
        .error(function(data,status) {
          $scope.infoMarkerStatus = 'Error: ' + status;
          if(cb) {
            cb();
          }
        });
    };

    $scope.renderHeatmap = function(cb) {

      if(!$scope.userHeatmap) {
        $scope.heatmapStatus = 'Not Displayed';
        if(cb) {
          cb();
        }
        return;
      }

      var gridspacing = $scope.gridSpacing;
      var bounds = $scope.map.getBounds();

      var ne = bounds.getNorthEast();
      var sw = bounds.getSouthWest();
      //set lat to min lat
      var lat = sw.lat();

      //while lat is less than max lat
      //build array of latitude steps
      var latArray = [lat];
      var latstep = (ne.lat() - sw.lat())/($scope.map.getDiv().clientHeight/gridspacing);
      while(lat < ne.lat()) {
        lat += latstep;
        latArray.push(lat);
      }

      //set lng to min lng
      var lng = sw.lng();

      //while lng is less than max lng
      //build array of longitude steps
      var lngArray = [lng];
      var lngstep = (ne.lng() - sw.lng())/($scope.map.getDiv().clientWidth/gridspacing);
      while(lng < ne.lng()) {
        lng += lngstep;
        lngArray.push(lng);
      }

      //build grid of points to overlay on map
      var viewportQuery = { points: { coordinates: []}};

      for(var i = 0; i < latArray.length; i+=1){
        for(var j = 0; j < lngArray.length; j+=1) {

          //calculate offset for longitude of every other row by half the grid spacing
          //and alternate positive and negative offset value. This is used to create a hexagonal cicle packing
          //which is more efficient and provides more coverage than the grid packing used in earlier versions
          var offset = 0;
          var lng_value = lngArray[j];
          if(i%2===0) {
            //even rows
            offset = lngstep/2;
            if(i%4===0) {
              //every other even row
              offset *= -1;
            }
          }
          else {
            //odd rows
            offset = 0;
          }

          lng_value = lngArray[j] + offset;

          viewportQuery.points.coordinates.push([latArray[i],lng_value]);
        }
      }

      $scope.heatmapStatus = 'Requesting';

      $http.post('/viewport/' + $scope.year + '/' + $scope.month + '/' + $scope.day + '/' + $scope.hour + '/' + $scope.parameter_name, viewportQuery)
        .success(function(response) {
          $scope.viewportData = [];

          for(var i=0;i<response.points.coordinates.length;i+=1){
            var point = response.points.coordinates[i];

            var latlng = new google.maps.LatLng(Number(point[0]),Number(point[1])); // jshint ignore:line

            // use google maps geometry library (client side) to only render points in the contiguous united states
            var isWithinPolygon =
              google.maps.geometry.poly.containsLocation //jshint ignore:line
              (latlng, $scope.uspolygon);

            if(isWithinPolygon) {
              $scope.viewportData.push(
                {
                  location: latlng, //jshint ignore:line
                  weight: response[$scope.parameter_name][i] <= 0 ? 0.00001 : response[$scope.parameter_name][i]
                });
            }
          }

          if($scope.userHeatmap && !heatmap.getMap()) {
            heatmap.setMap($scope.map);
          }

          heatmap.set('data', $scope.viewportData);

          $scope.heatmapStatus = 'Rendered';

          if(cb) {
            cb();
          }
        });
    };

    $scope.$on('mapInitialized', function(event, map) {

      heatmap = map.heatmapLayers.foo;

      heatmap.set('radius',$scope.slider.radius );
      heatmap.set('maxIntensity',$scope.slider.maxIntensity);

      $scope.map = map;

      if($scope.findOne)
      {
        $scope.findOne(map);
      }

      //clear heatmap when there is a zoom event to prevent bad visualization (red rectangle issue)
      google.maps.event.addListener //jshint ignore:line
      (map, 'zoom_changed', function() {
        heatmap.setMap(null);
      });

      //set up polygon containing the contiguous united states - only render points in this polygon
      var uspolygoncoordinates = [
        /* jshint ignore:start */
        new google.maps.LatLng(46.195042,-125.112305),
        new google.maps.LatLng(41.771312,-125.419922),
        new google.maps.LatLng(39.130060,-124.936523),
        new google.maps.LatLng(34.307144,-121.245117),
        new google.maps.LatLng(32.324276,-117.465820),
        new google.maps.LatLng(32.138409,-115.268555),
        new google.maps.LatLng(30.789037,-111.357422),
        new google.maps.LatLng(30.751278,-108.237305),
        new google.maps.LatLng(30.334954,-106.303711),
        new google.maps.LatLng(28.574874,-104.194336),
        new google.maps.LatLng(28.497661,-102.700195),
        new google.maps.LatLng(29.152161,-101.953125),
        new google.maps.LatLng(27.994401,-100.898438),
        new google.maps.LatLng(26.076521,-99.404297 ),
        new google.maps.LatLng(25.522615,-97.031250 ),
        new google.maps.LatLng(25.958045,-96.152344 ),
        new google.maps.LatLng(27.215556,-96.635742 ),
        new google.maps.LatLng(28.497661,-94.658203 ),
        new google.maps.LatLng(28.767659,-90.659180 ),
        new google.maps.LatLng(28.574874,-88.417969 ),
        new google.maps.LatLng(29.688053,-88.461914 ),
        new google.maps.LatLng(29.573457,-86.000977 ),
        new google.maps.LatLng(29.113775,-84.770508 ),
        new google.maps.LatLng(29.228890,-84.111328 ),
        new google.maps.LatLng(25.878994,-82.441406 ),
        new google.maps.LatLng(24.5,-82 ),
        new google.maps.LatLng(24.5,-79 ),
        new google.maps.LatLng(26.627818,-79.233398 ),
        new google.maps.LatLng(31.090574,-80.419922 ),
        new google.maps.LatLng(34.741612,-75.673828 ),
        new google.maps.LatLng(36.985003,-75.058594 ),
        new google.maps.LatLng(40.111689,-73.344727 ),
        new google.maps.LatLng(40.813809,-69.082031 ),
        new google.maps.LatLng(42.940339,-69.653320 ),
        new google.maps.LatLng(44.653024,-66.269531 ),
        new google.maps.LatLng(47.842658,-67.456055 ),
        new google.maps.LatLng(47.517201,-69.653320 ),
        new google.maps.LatLng(45.798170,-71.147461 ),
        new google.maps.LatLng(45.706179,-74.750977 ),
        new google.maps.LatLng(44.339565,-77.255859 ),
        new google.maps.LatLng(43.421009,-79.892578 ),
        new google.maps.LatLng(42.650122,-81.518555 ),
        new google.maps.LatLng(45.460131,-82.089844 ),
        new google.maps.LatLng(48.429201,-87.670898 ),
        new google.maps.LatLng(49.353756,-94.218750 ),
        new google.maps.LatLng(49.696062,-124.936523),
        new google.maps.LatLng(46.195042,-125.112305)
        /* jshint ignore:end */
      ];

      //jshint ignore:start
      $scope.uspolygon = new google.maps.Polygon({
        paths: uspolygoncoordinates,
        strokeOpacity : 0,
        fillOpacity: 0
      });
      //jshint ignore:end

      $scope.uspolygon.setMap(map);

      //set up event listeners - when the user stops browsing the map for a moment, rerender the pollution data
      google.maps.event.addListener //jshint ignore:line
      ($scope.map, 'idle', function() {
        //post each time there is a map idle event to interpolate the gridded points
        $scope.renderHeatmap();

      });
    });

    $scope.changeMaxValue = function() {
      heatmap.set('maxIntensity',$scope.slider.maxIntensity);
      $scope.slider.calculate();
    };

    $scope.toggleMarkers = function() {
      $scope.userMarkers = $scope.userMarkers ? false : true;

      $scope.infoMarkerStatus = 'Toggling';

      if ($scope.markers.length === 0) {
        $scope.renderMarkers(function () {
          if ($scope.userMarkers) {
            for (var i = 0; i < $scope.markers.length; i += 1) {
              $scope.markers[i].setMap($scope.map);
            }
          }
          $scope.infoMarkerStatus = $scope.userMarkers ? 'Rendered' : 'Not Displayed';
        });
      }
      else {
        for (var i = 0; i < $scope.markers.length; i += 1) {
          $scope.markers[i].setMap($scope.userMarkers ? $scope.map : null);
        }
        $scope.infoMarkerStatus = $scope.userMarkers ? 'Rendered' : 'Not Displayed';
      }
    };

    $scope.toggleTriangles = function() {
      $scope.userTriangles = $scope.userTriangles ? false : true;

      $scope.triangleStatus = 'Toggling';

      if($scope.triangles.length === 0) {
        $scope.renderTriangles(function() {
          if($scope.userTriangles) {
            for (var i = 0; i < $scope.triangles.length; i+=1) {
              $scope.triangles[i].setMap($scope.map);
            }
          }
          $scope.triangleStatus = $scope.userTriangles ? 'Rendered' : 'Not Displayed';
        });
      }
      else {
        for (var i = 0; i < $scope.triangles.length; i+=1) {
          $scope.triangles[i].setMap($scope.userTriangles ? $scope.map : null);
        }
        $scope.triangleStatus = $scope.userTriangles ? 'Rendered' : 'Not Displayed';
      }
    };

    $scope.toggleHeatmap= function(event) {
      $scope.userHeatmap = $scope.userHeatmap ? false : true;
      $scope.renderHeatmap(function() {
        heatmap.setMap($scope.userHeatmap ? $scope.map : null);
      });
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
      heatmap.set('radius', $scope.slider.radius);
      $scope.slider.calculate();
    };

    $scope.changeOpacity = function() {
      heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
    };

    $scope.changeParameter = function (parameter_name) {
      $scope.parameter_name = parameter_name;
      $scope.renderMap();
    };

    $scope.preventRender = false;

    $scope.renderMap = function() {
      //prevent rendering more than once a second
      if($scope.preventRender) {
        return;
      }
      else {
        $scope.preventRender = true;
        $timeout(function() {
          $scope.preventRender = false;
          //render one last time if the current date, time, or parameter are not the currently rendered
          if(
            $scope.renderedYear !== $scope.year ||
            $scope.renderedDay !== $scope.day ||
            $scope.renderedHour !== $scope.hour ||
            $scope.renderedMonth !== $scope.month ||
            $scope.renderedParameter !== $scope.parameter_name
          ) {
            $scope.renderMap();
          }
        }, 1000);
      }

      $scope.renderedYear = $scope.year;
      $scope.renderedDay = $scope.day;
      $scope.renderedHour = $scope.hour;
      $scope.renderedMonth = $scope.month;
      $scope.renderedParameter = $scope.parameter_name;
      $scope.renderedTimeString = $scope.month + '/' + $scope.day + '/' + $scope.year + ' ' + $scope.hour + ':00';

      //disable heatmap first, and then adjust intensity parameter to prevent visualization artifacts
      heatmap.setMap(null);
      $scope.slider.maxIntensity = $scope.slider.parameterMaxIntensity[$scope.parameter_name];
      heatmap.set('maxIntensity',$scope.slider.maxIntensity);
      $scope.slider.calculate();

      $scope.renderHeatmap();

      for (var i = 0; i < $scope.triangles.length; i+=1) {
        $scope.triangles[i].setMap(null);
      }

      $scope.renderTriangles(function() {
        if($scope.userTriangles) {
          for (var i = 0; i < $scope.triangles.length; i+=1) {
            $scope.triangles[i].setMap($scope.map);
          }
        }
        $scope.triangleStatus = $scope.userTriangles ? 'Rendered' : 'Not Displayed';
      });

      for (i = 0; i < $scope.markers.length; i+=1) {
        $scope.markers[i].setMap(null);
      }

      $scope.renderMarkers(function() {
        if($scope.userMarkers) {
          for (var i = 0; i < $scope.markers.length; i+=1) {
            $scope.markers[i].setMap($scope.map);
          }
        }
        $scope.infoMarkerStatus = $scope.userMarkers ? 'Rendered' : 'Not Displayed';
      });
    };
  }
]);



