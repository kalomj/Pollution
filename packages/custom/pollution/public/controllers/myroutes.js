'use strict';

angular.module('mean.pollution').controller('MyRoutesCtrl', ['$scope', '$stateParams', '$location', 'Global', 'MyRoutes',
  function($scope, $stateParams, $location, Global, MyRoutes) {
    $scope.global = Global;
    $scope.hasAuthorization = function(myroute) {
      if (!myroute || !myroute.user) return false;
      return $scope.global.isAdmin || myroute.user._id === $scope.global.user._id;
    };

    $scope.create = function(isValid) {
      if (isValid) {
        var myroute = new MyRoutes({
          mode: 'walk'
        });
        myroute.$save(function(response) {
          $location.path('myroutes/' + response._id);
        });

      } else {
        $scope.submitted = true;
      }
    };

    $scope.remove = function(myroute) {
      if (myroute) {
        myroute.$remove(function(response) {
          for (var i in $scope.myroutes) {
            if ($scope.myroutes[i] === myroute) {
              $scope.myroutes.splice(i,1);
            }
          }
          $location.path('myroutes');
        });
      } else {
        $scope.myroute.$remove(function(response) {
          $location.path('myroutes');
        });
      }
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
      });
    };
  }
]);
