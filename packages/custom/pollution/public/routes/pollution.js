'use strict';

angular.module('mean.pollution').config(['$stateProvider',
  function($stateProvider) {

    // TODO check logged in status - don't copy and paste code from
    // the myroutes check, set up a service to reuse code

    $stateProvider.state('mapIndex', {
      url: '/gmap',
      templateUrl: 'pollution/views/gmap/index.html'
    });
  }
]);