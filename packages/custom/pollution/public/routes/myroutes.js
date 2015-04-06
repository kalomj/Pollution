'use strict';

angular.module('mean.pollution').config(['$stateProvider',
  function($stateProvider) {

    // Check if the user is connected
    var checkLoggedin = function($q, $timeout, $http, $location) {
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/loggedin').success(function(user) {
        // Authenticated
        if (user !== '0') $timeout(deferred.resolve);

        // Not Authenticated
        else {
          $timeout(deferred.reject);
          $location.url('/login');
        }
      });

      return deferred.promise;
    };

    //Set up RESTful states for listing, viewing, and uploading
    //personal routes
    $stateProvider.state('My Routes', {
      url: '/myroutes',
      templateUrl: 'pollution/views/myroutes/list.html',
      resolve: {
        loggedin: checkLoggedin
      }
    });

    $stateProvider.state('loadRoute', {
      url: '/myroutes/:myrouteId',
      templateUrl: 'pollution/views/myroutes/view.html',
      resolve: {
        loggedin: checkLoggedin
      }
    });

    $stateProvider.state('createRoute', {
      url: '/myroutes/create',
      templateUrl: 'pollution/views/myroutes/create.html',
      resolve: {
        loggedin: checkLoggedin
      }
    });

    $stateProvider.state('editRoute', {
      url: '/myroutes/:myrouteId/edit',
      templateUrl: 'pollution/views/myroutes/edit.html',
      resolve: {
        loggedin: checkLoggedin
      }
    });
  }
]);