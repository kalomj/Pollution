'use strict';

/* jshint -W098 */
angular.module('mean.pollution').controller('PollutionController', ['$scope', 'Global', 'Pollution',
  function($scope, Global, Pollution) {
    $scope.global = Global;
    $scope.package = {
      name: 'pollution'
    };
  }
]);

angular.module('mean.pollution').controller('myLoginCtrl', ['$scope', '$rootScope', '$http', '$location', 'Global','$log','$state',
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


