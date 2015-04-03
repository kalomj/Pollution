'use strict';

angular.module('mean.pollution').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider.state('My Routes', {
            url: '/pollution/',
            templateUrl: 'pollution/views/gmap/myroutes.html'
        });

      $stateProvider.state('mapIndex', {
        url: '/pollution/',
        templateUrl: 'pollution/views/gmap/index.html'
      });
    }
]);