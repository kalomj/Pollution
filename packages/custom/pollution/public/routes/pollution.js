'use strict';

angular.module('mean.pollution').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('pollution example page', {
      url: '/pollution/example',
      templateUrl: 'pollution/views/index.html'
    });
  }
]);
