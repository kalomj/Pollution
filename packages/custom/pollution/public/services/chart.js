'use strict';

angular.module('mean.pollution')

    .factory('Chart', ['$resource',
        function($resource) {
            return $resource('chart/:measurement_key', {
                measurement_key: '@measurement_key'
            }, {
                get: {
                    method: 'GET',
                    isArray : true
                }
            });
        }
    ]);