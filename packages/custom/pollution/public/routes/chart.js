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
        $stateProvider.state('List Chart', {
            url: '/chart',
            templateUrl: 'pollution/views/chart/list.html',
            resolve: {
                loggedin: checkLoggedin
            }
        });

        $stateProvider.state('Show Chart', {
            url: '/chart/:measurement_key',
            templateUrl: 'pollution/views/chart/view.html',
            resolve: {
                loggedin: checkLoggedin
            }
        });
    }
]);