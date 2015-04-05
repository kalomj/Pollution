'use strict';

angular.module('mean.pollution').config(['$stateProvider',
  function($stateProvider) {

    $stateProvider.state('mapIndex', {
      url: '/gmap',
      templateUrl: 'pollution/views/gmap/index.html'
    });

    //Set up RESTful states for listing, viewing, and uploading
    //personal routes
    $stateProvider.state('My Routes', {
      url: '/myroutes',
      templateUrl: 'pollution/views/myroutes/list.html'
    });

    $stateProvider.state('loadRoute', {
      url: '/myroutes/:myrouteId',
      templateUrl: 'pollution/views/myroutes/view.html'
    });

    $stateProvider.state('createRoute', {
      url: '/myroutes/create',
      templateUrl: 'pollution/views/myroutes/create.html'
    });

    $stateProvider.state('editRoute', {
      url: '/myroutes/:myrouteId/edit',
      templateUrl: 'pollution/views/myroutes/edit.html'
    });
  }
]);