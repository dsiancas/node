'use strict';
angular.module('shellcatchApp.directives').
directive('dashboardDirective', function () {
    return {
        restrict: 'EA',
        scope: {
            organization: '@organization',
            suborganization: '@suborganization',
            localname: '@localname',
            confederation: '@confederation'
        },
        templateUrl: 'partials/dashboard-info.html',
    
        controller: [
            '$rootScope', '$translate', '$scope', '$routeParams', '$modal', 
            'apiService',
           function ($rootScope, $translate, $scope, $routeParams, $modal, apiService)  {

            $scope.loading = true;
            $scope.tripsSummaryTitle = $translate.instant('TRIPS_SUMMARY');
            $scope.tripsCommunitySummary = $translate.instant(
                'TRIPS_COMMUNITY_SUMMARY');
            $scope.turtle_information = $translate.instant(
                'TURTLE_INFORMATION');
            $scope.turtle_name = $translate.instant('TURTLE_NAME');
            $scope.dashboard_recording_name = $translate.instant('DASHBOARD_RECORDING_NAME');
            $scope.sea_name = $translate.instant('SEA_NAME');
            $scope.land_name = $translate.instant('LAND_NAME');

            $rootScope.$watch('apiRoot', function (newValue, oldValue) {
                if (newValue) {
                    $scope.getBoats();
                }
            });

            $scope.getBoats = function () {
                var postData = {
                    "organization": $scope.organization
                }
                if($scope.suborganization) {
                    postData["suborganization"] = $scope.suborganization
                }
                
                $scope.loading = true;
                apiService.POST($rootScope.apiRoot.dashboard_data, 
                    postData).
                then(function (data) {
                    $scope.loading = false;
                    $scope.sea= 0;
                    $scope.land= 0;
                    $scope.land_water_data = data.land_water_by_date;
                    $scope.trips_summary = data.trips_summary;
                    $scope.total_turtles = data.total_turtles;
                    
                   var index;

                   var categorie_m=[
                   'Jan','Feb','Mar','Apr','May', 
                   'Jun','Jul','Aug','Sep', 'Oct', 'Nov','Dec'];

                   var categorie_date=[];
                   var categorie_total_land=[];
                   var categorie_total_water=[];

                   for (
                     index = 0; 
                     index < $scope.land_water_data.length ; 
                     index++){
                        if ($scope.land_water_data[index]['years'] >= 2015) {  
                            categorie_date.push(
                                categorie_m[
                                    $scope.land_water_data[index]['months']
                                    -1] +
                                $scope.land_water_data[index]['years']);
                            categorie_total_water.push(
                                $scope.land_water_data[index]['water_trips']);
                            categorie_total_land.push(
                                $scope.land_water_data[index]['land_trips']);
                        }
                   }
                    
                var category_turtle_x = [];
                var category_turtle_y = [];
                $scope.amount_turtles = 0;
                for (index = 0; index<$scope.total_turtles.length ; index++) {          
                    category_turtle_x.push(categorie_m[$scope.total_turtles[index]['only_month']-1]
                        +$scope.total_turtles[index]['only_year']);
                    category_turtle_y.push($scope.total_turtles[index]['count']);
                    $scope.amount_turtles += $scope.total_turtles[index]['count'];
                }

                    var index;
                    var total_zone = [];
                    var total_sea_zone = [];
                    var total_land_zone = [];
                    var zone_name = []
                    var size = $scope.trips_summary.length;


                    for (index = 0; index < size ; index++) {
                        total_sea_zone.push(
                            $scope.trips_summary[index]['commu_water'])
                        $scope.sea += $scope.trips_summary[index][
                            'commu_water']
                        total_land_zone.push(
                            $scope.trips_summary[index]['commu_land'])
                        $scope.land += $scope.trips_summary[index][
                            'commu_land']
                        zone_name.push(
                            $scope.trips_summary[index]['community'])
                        total_zone.push(
                            parseInt(total_sea_zone[index])
                            + parseInt(total_land_zone[index]) )                        
                    }
                    $scope.trips = $scope.sea + $scope.land;
                    $scope.total_commu = total_zone;

                    $(function () {
                    $('#container_two'+$scope.localname).highcharts({
                        chart: {
                            type: 'column'
                        },
                        title: {
                            text: $scope.tripsCommunitySummary
                        },
                        xAxis: {
                            categories: zone_name,
                            crosshair: true
                        },
                        yAxis: {
                            min: 0,
                            title: {
                                text: $scope.dashboard_recording_name
                            }
                        },
                        tooltip: {
                            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                                '<td style="padding:0"><b>{point.y} </b></td></tr>',
                            footerFormat: '</table>',
                            shared: true,
                            useHTML: true
                        },
                        plotOptions: {
                            column: {
                                pointPadding: 0.2,
                                borderWidth: 0
                            }
                        },
                        series: [{
                            name: $scope.sea_name,
                            data: total_sea_zone,
                            color: '#1E90FF'

                        }, {
                            name: $scope.land_name,
                            data: total_land_zone,
                           color: '#FFCC00'

                        }]
                    });
                });

                    $(function () {
                    $('#container_turtles'+$scope.localname).highcharts({
                        chart: {
                            type: 'line'
                        },
                        title: {
                            text: $scope.turtle_information
                        },
                        xAxis: {
                            categories: category_turtle_x,
                            crosshair: true
                        },
                        yAxis: {
                            min: 0,
                            title: {
                                text: 'Total'
                            }
                        },
                        tooltip: {
                            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                                '<td style="padding:0"><b>{point.y} </b></td></tr>',
                            footerFormat: '</table>',
                            shared: true,
                            useHTML: true
                        },
                        plotOptions: {
                            column: {
                                pointPadding: 0.2,
                                borderWidth: 0
                            }
                        },
                        series: [{
                            name: $scope.turtle_name,
                            data: category_turtle_y,
                            color: '#1E90FF'

                        }]
                    });
                });

                    $(function () {
                    $('#container'+$scope.localname).highcharts({
                        chart: {
                            type: 'column'
                        },
                        title: {
                            text: $scope.tripsSummaryTitle
                        },
                        xAxis: {
                            categories: categorie_date,
                        },
                        yAxis: {
                            min: 0,
                            title: {
                                text: $scope.dashboard_recording_name
                            },
                            stackLabels: {
                                enabled: true,
                                style: {
                                    fontWeight: 'bold',
                                    color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                                }
                            }
                        },
                        legend: {
                            align: 'right',
                            x: -30,
                            verticalAlign: 'top',
                            y: 25,
                            floating: true,
                            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'gray',
                            borderColor: '#CCC',
                            borderWidth: 1,
                            shadow: false
                        },
                        tooltip: {
                            headerFormat: '<b>{point.x}</b><br/>',
                            pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
                        },
                        plotOptions: {
                            column: {
                                stacking: 'normal',
                                dataLabels: {
                                    enabled: true,
                                    color: 'white',
                                    style: {
                                        textShadow: '0 0 0px black'
                                    }
                                }
                            }
                        },
                        series: [{
                            name: $scope.sea_name,
                            data: categorie_total_water,
                            color: '#1E90FF'
                        },  {
                            name: $scope.land_name,
                            data: categorie_total_land,
                            color: '#FFCC00'
                        }]
                    });
                }


              );
            });
        };

      }

    ]}
});
