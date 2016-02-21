'use strict';

angular.module('mean.pollution').controller('ChartCtrl', ['$scope', '$stateParams', '$location', 'Global', 'Chart',
    function($scope, $stateParams, $location, Global, Chart) {
        $scope.global = Global;



        $scope.labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
        $scope.data = [
            [65, 59, 80, 81, 56, 55, 40],
            [28, 48, 40, 19, 86, 27, 90]
        ];
        $scope.options = {
            responsive: false
        };

        $scope.sitename = 'Unknown';
        $scope.parameter_name = 'Unknown';
        $scope.units = 'Unknown';
        $scope.data_source = 'Unknown';
        $scope.series = [''];

        $scope.find = function() {
            if(!$scope.charts) {
                Chart.query(function (charts) {
                    $scope.charts = charts;
                });
            }

        };

        $scope.findOne = function() {

            Chart.get({
                measurement_key: $stateParams.measurement_key
            }, function(chart) {

                if(!chart || chart.length===0) {
                    $scope.sitename = 'No Data Found';
                    $scope.parameter_name = '';
                    $scope.units = '';
                    return;
                }

                $scope.chart = chart;

                $scope.labels = [];

                $scope.data = [ [] ];

                $scope.series = [];

                $scope.parameter_name = chart[0].parameter_name;
                $scope.units = chart[0].reporting_units;
                $scope.sitename = chart[0].sitename + ', ' + chart[0].country_code;
                $scope.data_source = chart[0].data_source;
                $scope.series.push(chart[0].parameter_name + ' ' + chart[0].reporting_units);

                for(var i = chart.length-1; i >= 0; i -= 1) {
                    $scope.labels.push(chart[i].valid_date + ' ' + chart[i].valid_time);
                    $scope.data[0].push(chart[i].value);
                }

                /* jshint ignore:start */

                /* jshint ignore:end */
            },
            function(err) {
                console.log('error');
                console.log(err);
            });

        };
    }
]);
