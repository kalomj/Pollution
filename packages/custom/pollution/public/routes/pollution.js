'use strict';

angular.module('mean.pollution').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider.state('My Routes', {
            url: '/pollution/example',
            templateUrl: 'pollution/views/index.html'
        });
    }
]);