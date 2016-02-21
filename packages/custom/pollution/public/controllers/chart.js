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

        //given a chart response from the server
        $scope.addData = function(chart,parameter_name) {
            $scope.data.push([]);
            if(!chart || chart.length===0) {
                $scope.series.push('No Data For ' + parameter_name);
            } else {


                $scope.series.push(chart[0].parameter_name + ' ' + chart[0].reporting_units);

                for (var i = chart.length - 1; i >= 0; i -= 1) {
                    var j = 0;
                    for (/*don't initialize j, keep it running*/; j < $scope.hour_codes.length; j += 1) {

                        //hour_codes match, just push data to arrays
                        if (chart[i].hour_code === $scope.hour_codes[j]) {
                            $scope.data[$scope.data_ix].push(chart[i].value);
                            break;
                        }

                        //proceed through secondary loop until hour_code match is found
                        else if (chart[i].hour_code > $scope.hour_codes[j]) {
                            continue;
                        }

                        //proceeding through the second loop will not yield results, add dummy data and break
                        else if (chart[i].hour_code < $scope.hour_codes[j]) {
                            $scope.data[$scope.data_ix].push(0);
                            break;
                        }
                    }
                }
            }
            $scope.data_ix += 1;
        };


        $scope.plotMore = function() {
            //first get baseline data so we can mine attributes
            $scope.aqsid = '';
            $scope.hour_codes = [];
            $scope.data_ix = 0;

            $scope.labels = [];

            $scope.data = [ ];

            $scope.series = [];


            Chart.get({
                measurement_key: $stateParams.measurement_key
            })

                .$promise.then(
                //first mine data based on root measurement key
                function(chart) {

                    if(!chart || chart.length===0) {
                        $scope.sitename = 'No Data Found';
                        $scope.parameter_name = '';
                        $scope.units = '';
                        return;
                    }

                    $scope.aqsid = chart[0].aqsid.substr(2);

                    for(var i = chart.length-1; i >= 0; i -= 1) {
                        $scope.hour_codes.push(chart[i].hour_code);
                        $scope.labels.push(chart[i].valid_date + ' ' + chart[i].valid_time);
                    }

                    return Chart.get({ measurement_key: $scope.aqsid + 'PM25'}).$promise;
                }

            ).then(
                //then add PM25 information to the chart
                function(chart) {

                    $scope.addData(chart,'PM25');

                    return Chart.get({ measurement_key: $scope.aqsid + 'PM10'}).$promise;
                }

            ).then(
                //then add PM10 information to the chart
                function(chart) {
                    $scope.addData(chart,'PM10');

                    return Chart.get({ measurement_key: $scope.aqsid + 'CO'}).$promise;
                }
            ).then(
                //then add CO information to the chart
                function(chart) {
                    $scope.addData(chart,'CO');

                    return Chart.get({ measurement_key: $scope.aqsid + 'NO2'}).$promise;
                }

            ).then(
                //then add NO2 information to the chart
                function(chart) {
                    $scope.addData(chart,'NO2');

                    return Chart.get({ measurement_key: $scope.aqsid + 'OZONE'}).$promise;
                }

            ).then(
                //then add OZONE information to the chart
                function(chart) {
                    $scope.addData(chart,'OZONE');

                    return Chart.get({ measurement_key: $scope.aqsid + 'SO2'}).$promise;
                }

            ).then(
                //then add SO2 information to the chart
                function(chart) {
                    $scope.addData(chart,'SO2');
                }
            );
        };
    }
]);
