'use strict';
angular.module('shellcatchApp.directives').
directive('boatPanel', function () {
    return {
        scope: {
            tripData: '=',
            tripPictures: '=',
            boats: '=',
            currentBoat: '=',
            selectedItem: '='
        },
        templateUrl: 'partials/boatPanel.html',
        controller: [
        '$rootScope', '$scope', '$element', 'apiService',
        function ($rootScope, $scope, $element, apiService) {

            var maxHeight = $(window).height(),
            listElem  = $('.panel-list-container');
            listElem.height(maxHeight - 90);
            $scope.loading      = false;
            $scope.loadingTrips = false;

            $rootScope.$watch('apiRoot', function (newValue, oldValue) {
                if (newValue) {
                    $scope.getBoats();
                    $scope.getTrips();
                }
            });

            $scope.$watch('currentBoat', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $scope.$emit('event:getBoatChartData', {
                        boat: newValue
                    });
                }
            });

            $scope.$watch('currentTrip', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $scope.$emit('event:getTripChartData', {
                        trip: newValue
                    });
                }
            });

            $scope.getBoats = function () {
                $scope.loading = true;
                apiService.GET($rootScope.apiRoot.boats).
                then(function (data) {
                    $scope.loading = false;
                    $scope.boats   = data.data;
                }, function (data) {
                    $scope.loading    = false;
                    $scope.errorBoats = 'NO_BOATS_ASSIGNED';
                });
            };

            $scope.getTrips = function (amigoId) {
                $scope.loadingTrips = true;
                amigoId = typeof amigoId !== 'undefined' ? amigoId : null;

                if ($scope.currentBoat === amigoId) {
                    return;
                }

                $scope.currentBoat = amigoId;
                $scope.selectedItem = !!amigoId ? {
                    'boat': amigoId
                } : {};

                var data = !!amigoId ? {
                    'boat': amigoId
                } : null;
                $scope.trips = null;

                apiService.GET($rootScope.apiRoot.trips, data).
                then(function (data) {
                    $scope.loadingTrips = false;
                    $scope.trips        = data;
                    $scope.getBoatTripData();
                }, function (data) {
                    $scope.loadingTrips = false;
                    $scope.errorTrips   = 'NO_TRIPS_ASSIGNED';
                });
            };

            $scope.getBoatTripData = function (boat) {
                boat = typeof boat !== 'undefined' ? boat : null;
                if (boat) {
                    $scope.selectedItem = {
                        'boat': boat
                    };
                }
                $scope.currentTrip = null;
                // if ($scope.selectedItem) {
                //     $scope.$emit('event:loadingData', {value: true});
                // } else {
                //     $scope.$emit('event:loadingData', {value: false});
                // }
            };

            $scope.getTripData = function (amigoId) {
                $scope.$emit('event:loadingData', {value: true});
                $scope.currentTrip = amigoId;
                $scope.selectedItem.trip = amigoId;
            };
        }
        ]
    }
});
