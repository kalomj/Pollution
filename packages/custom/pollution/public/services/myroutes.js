'use strict';

angular.module('mean.pollution')

  .factory('MyRoutes', ['$resource',
    function($resource) {
      return $resource('myroutes/:myrouteId', {
        articleId: '@_id'
      }, {
        update: {
          method: 'PUT'
        }
      });
    }
  ]);
