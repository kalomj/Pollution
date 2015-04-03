'use strict';

angular.module('mean.pollution').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider.state('My Routes', {
            url: '/pollution/',
            templateUrl: 'pollution/views/gmap/index.html'
        });
    }
]);