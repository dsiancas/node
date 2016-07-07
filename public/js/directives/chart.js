'use strict';
angular.module('shellcatchApp.directives').
directive('chart', function () {
    return {
        scope: {
            type: '=',
            object: '='
        },
        templateUrl: 'partials/chart.html',
        controller: [
        '$rootScope', '$scope', '$element', 'apiService', 'CHART_COLOR_PALETTE',
        function ($rootScope, $scope, $element, apiService, CHART_COLOR_PALETTE) {
            $scope.showIcon    = true;
            $scope.currentBoat = null;
            $scope.currentTrip = null;
            $scope.translation = translationsEN;

            if ($rootScope.selectedLanguage === 'en') {
                $scope.translation = translationsEN;
            } else {
                $scope.translation = translationsES;
            }

            $rootScope.$watch('selectedLanguage', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    if (newValue === 'en') {
                        $scope.translation = translationsEN;
                    } else {
                        $scope.translation = translationsES;
                    }
                    if ($scope.chartData) {
                        $scope.initChart();
                    }
                }
            });

            $scope.$on('event:updateLoadingData', function (event, data) {
                $scope.loadingData = data.value;
            });

            $scope.$on('event:getBoatData', function (event, data) {
                $scope.showIcon    = false;
                $scope.currentBoat = data.boat;
                $scope.getChartData();
            });

            $scope.$on('event:getTripData', function (event, data) {
                $scope.showIcon    = false;
                $scope.currentTrip = data.trip;
                $scope.getChartData();
            });

            $scope.$on('event:stopDataUpdated', function () {
                $scope.getChartData();
            });

            $scope.$on('$destroy', function () {
                if ($scope.chart) {
                    $scope.chart.destroy();
                }
            });

            $scope.getSize = function (obj) {
                var size = 0;
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        size++;
                    }
                }
                return size;
            };

            $scope.getChartData = function () {
                $scope.loading = true;
                var query = {};

                if ($scope.currentBoat) {
                    query['boat'] = $scope.currentBoat;
                } else {
                    if ($scope.currentTrip && $scope.currentTrip !== 'all') {
                        query['trip'] = $scope.currentTrip;
                    }
                }

                apiService.GET($rootScope.apiRoot.chart_stats, query).
                then(function (data) {
                    $scope.chartData = data;
                    if ($scope.object) {
                        var exists = false;
                        for (var i = 0; i < $scope.chartData.length; i++) {
                            if ($scope.chartData[i].object_type === $scope.object) {
                                exists = true;
                            }
                        }

                        if (!exists) {
                            $scope.chartData[$scope.chartData.length] = angular.copy($scope.chartData[$scope.chartData.length - 1]);
                            $scope.chartData[$scope.chartData.length - 1].object_type = $scope.object;
                            $scope.chartData[$scope.chartData.length - 1].count = 0;
                        }
                    }
                    $scope.initChart();
                });
            };

            $scope.getData = function (data, label) {
                var ret = [];
                for (var key in data) {
                    var exists = false;
                    for (var i = 0; i < data[key].values.length; i++) {
                        if (data[key].values[i].label === label) {
                            ret.push(data[key].values[i].value);
                            exists = true;
                        }
                    }

                    if (!exists) {
                        ret.push(0);
                    }
                }

                return ret;
            };

            $scope.initChart = function () {
                if ($scope.chart) {
                    $scope.chart.destroy();
                    $element.find('ul').remove();
                }
                var data = {}, chartData = [];
                var ctx = $element.find('#canvas')[0].getContext("2d");

                for (var i = 0; i < $scope.chartData.length; i++) {
                    if (!data[$scope.chartData[i].trip]) {
                        data[$scope.chartData[i].trip] = {
                            date:   moment.utc($scope.chartData[i].date).local().format("MM/DD/YY"),
                            values: []
                        };
                    }

                    data[$scope.chartData[i].trip].values.push({
                        label: $scope.chartData[i].object_type ? $scope.chartData[i].object_type : 'empty',
                        value: $scope.chartData[i].count
                    });
                }

                if ($scope.object) {
                    var labels = [];
                    var datasets = [];
                    var added = {};
                    for (var key in data) {
                        labels.push(data[key].date);

                        for (var i = 0; i < data[key].values.length; i++) {
                            var label = data[key].values[i].label;
                            var dddata = $scope.getData(data, $scope.object);
                            if (!added[label] && data[key].values[i].label === $scope.object) {
                                datasets.push({
                                    label:                $scope.translation[data[key].values[i].label],
                                    fillColor:            "rgba(255,255,255,0)",
                                    pointStrokeColor:     "#fff",
                                    pointHighlightFill:   "#fff",
                                    strokeColor:          CHART_COLOR_PALETTE[label].normal,
                                    pointColor:           CHART_COLOR_PALETTE[label].normal,
                                    pointHighlightStroke: CHART_COLOR_PALETTE[label].normal,
                                    data:                 dddata
                                });
                            }
                            added[label] = true;
                        }
                    }

                    $scope.chart = new Chart(ctx).Line({
                        labels:   labels,
                        datasets: datasets
                    }, {
                        responsive:          true,
                        bezierCurveTension:  0,
                        maintainAspectRatio: false,
                        tooltipTemplate:     "<%if (label){%><%=label%>: <%}%><%= value %>",
                    });
                    $element.find('.panel-body').append($scope.chart.generateLegend());
                } else {
                    if ($scope.getSize(data) > 1 && $scope.type !== 'pie') {
                        var labels = [];
                        var datasets = [];
                        var added = {};
                        for (var key in data) {
                            labels.push(data[key].date);

                            for (var i = 0; i < data[key].values.length; i++) {
                                var label = data[key].values[i].label;
                                var dddata = $scope.getData(data, data[key].values[i].label);
                                if (!added[label] && data[key].values[i].label !== 'trash') {
                                    datasets.push({
                                        label:                $scope.translation[data[key].values[i].label],
                                        fillColor:            "rgba(255,255,255,0)",
                                        pointStrokeColor:     "#fff",
                                        pointHighlightFill:   "#fff",
                                        strokeColor:          CHART_COLOR_PALETTE[label].normal,
                                        pointColor:           CHART_COLOR_PALETTE[label].normal,
                                        pointHighlightStroke: CHART_COLOR_PALETTE[label].normal,
                                        data:                 dddata
                                    });
                                }
                                added[label] = true;
                            }
                        }

                        $scope.chart = new Chart(ctx).Line({
                            labels:   labels,
                            datasets: datasets
                        }, {
                            responsive:          true,
                            bezierCurveTension:  0,
                            maintainAspectRatio: false,
                            tooltipTemplate:     "<%if (label){%><%=label%>: <%}%><%= value %>",
                        });
                        $element.find('.panel-body').append($scope.chart.generateLegend());
                    } else {
                        var entries = {};
                        for (var key in data) {
                            for (var i = 0; i < data[key].values.length; i++) {
                                if (!entries[data[key].values[i].label]) {
                                    entries[data[key].values[i].label] = 0;
                                }
                                entries[data[key].values[i].label] += data[key].values[i].value;
                            }
                        }

                        for (var key in entries) {
                            if (key !== "trash") {
                                chartData.push({
                                    label:     $scope.translation[key],
                                    value:     entries[key],
                                    color:     CHART_COLOR_PALETTE[key].normal,
                                    highlight: CHART_COLOR_PALETTE[key].hover
                                });
                            }
                        }

                        $scope.chart = new Chart(ctx).Pie(chartData, {
                            responsive:          true,
                            maintainAspectRatio: false
                        });
                        $element.find('.panel-body').append($scope.chart.generateLegend());
                    }
                }

                $scope.loading = false;
            };
        }
        ]
    }
});
