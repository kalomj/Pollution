'use strict';

/* jshint -W098 */
angular.module('mean.pollution')
  .controller('myLoginCtrl', ['$scope', '$rootScope', '$http', '$location', 'Global','$log','$state',
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
]).controller('myRegisterCtrl', ['$scope', '$rootScope', '$http', '$location', 'Global','$state',
  function($scope, $rootScope, $http, $location, Global, $state) {
    $scope.user = {};
    $scope.global = Global;
    $scope.global.registerForm = true;
    $scope.input = {
      type: 'password',
      placeholder: 'Password',
      placeholderConfirmPass: 'Repeat Password',
      iconClassConfirmPass: '',
      tooltipText: 'Show password',
      tooltipTextConfirmPass: 'Show password'
    };

    $scope.togglePasswordVisible = function() {
      $scope.input.type = $scope.input.type === 'text' ? 'password' : 'text';
      $scope.input.placeholder = $scope.input.placeholder === 'Password' ? 'Visible Password' : 'Password';
      $scope.input.iconClass = $scope.input.iconClass === 'icon_hide_password' ? '' : 'icon_hide_password';
      $scope.input.tooltipText = $scope.input.tooltipText === 'Show password' ? 'Hide password' : 'Show password';
    };
    $scope.togglePasswordConfirmVisible = function() {
      $scope.input.type = $scope.input.type === 'text' ? 'password' : 'text';
      $scope.input.placeholderConfirmPass = $scope.input.placeholderConfirmPass === 'Repeat Password' ? 'Visible Password' : 'Repeat Password';
      $scope.input.iconClassConfirmPass = $scope.input.iconClassConfirmPass === 'icon_hide_password' ? '' : 'icon_hide_password';
      $scope.input.tooltipTextConfirmPass = $scope.input.tooltipTextConfirmPass === 'Show password' ? 'Hide password' : 'Show password';
    };

    $scope.register = function() {
      $scope.usernameError = null;
      $scope.registerError = null;
      $http.post('/register', {
        email: $scope.user.email,
        password: $scope.user.password,
        confirmPassword: $scope.user.confirmPassword,
        username: $scope.user.username,
        name: $scope.user.name
      })
        .success(function() {
          // authentication OK
          $scope.registerError = 0;
          $rootScope.user = $scope.user;
          Global.user = $rootScope.user;
          Global.authenticated = !! $rootScope.user;
          $rootScope.$emit('loggedin');
          $state.go('mapIndex');
        })
        .error(function(error) {
          // Error: authentication failed
          if (error === 'Username already taken') {
            $scope.usernameError = error;
          } else if (error === 'Email already taken') {
            $scope.emailError = error;
          } else $scope.registerError = error;
        });
    };
  }
]);