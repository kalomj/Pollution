'use strict';

/* jshint -W098 */
angular.module('mean.pollution').controller('PollutionController', ['$scope', 'Global', 'Pollution',
  function($scope, Global, Pollution) {
    $scope.global = Global;
    $scope.package = {
      name: 'pollution'
    };
  }
]).controller('LayerHeatmapCtrl', ['$scope', 'Global', 'Pollution', '$log',
  function($scope, Global, Pollution, $log) {
    var heatmap;


    $scope.$on('mapInitialized', function(event, map) {

      heatmap = map.heatmapLayers.foo;

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
      heatmap.set('radius', heatmap.get('radius') ? null : 20);
    };

    $scope.changeOpacity = function() {
      heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
    };
  }
]).controller('myLoginCtrl', ['$scope', '$rootScope', '$http', '$location', 'Global','$log','$state',
  function($scope, $rootScope, $http, $location, Global, $log, $state) {
    // This object will be filled by the form
    $scope.user = {};
    $scope.global = Global;
    $scope.global.registerForm = false;
    $scope.input = {
      type: 'password',
      placeholder: 'Password',
      confirmPlaceholder: 'Repeat Password',
      iconClass: '',
      tooltipText: 'Show password'
    };

    $scope.togglePasswordVisible = function() {
      $scope.input.type = $scope.input.type === 'text' ? 'password' : 'text';
      $scope.input.placeholder = $scope.input.placeholder === 'Password' ? 'Visible Password' : 'Password';
      $scope.input.iconClass = $scope.input.iconClass === 'icon_hide_password' ? '' : 'icon_hide_password';
      $scope.input.tooltipText = $scope.input.tooltipText === 'Show password' ? 'Hide password' : 'Show password';
    };

    // Register the login() function
    $scope.login = function() {
      $http.post('/login', {
        email: $scope.user.email,
        password: $scope.user.password
      })
        .success(function(response) {
          // authentication OK
          $scope.loginError = 0;
          $rootScope.user = response.user;

          $rootScope.$emit('loggedin');

          $state.go('mapIndex');

        })
        .error(function() {
          $scope.loginerror = 'Authentication failed.';
        });
    };
  }
]);


