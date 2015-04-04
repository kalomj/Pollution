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

angular.module('mean.pollution').controller('myLoginCtrl', ['$scope', '$rootScope', '$http', '$location', 'Global','$log',
  function($scope, $rootScope, $http, $location, Global, $log) {
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

          /*if (response.redirect) {
            if (window.location.href === response.redirect) {
              //This is so an admin user will get full admin page
              window.location.reload();
            } else {*/
              //window.location = '/#!/pollution';//response.redirect;

              //window.location.href = '#!/mapIndex';
            $location.path('/gmap');
            $location.replace();
            $log.log($location.path());

           /* }
          } else {

          }*/
        })
        .error(function() {
          $scope.loginerror = 'Authentication failed.';
        });
    };
  }
]);


