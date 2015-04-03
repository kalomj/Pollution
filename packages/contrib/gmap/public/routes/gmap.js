'use strict';

angular.module('mean.gmap').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('gmap example page', {
      url: '/gmap/example',
      templateUrl: 'gmap/views/index.html'
    });
  }
]);
