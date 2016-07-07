// 'use strict';
// angular.module('ViewerDirective').
// directive('boatTripSelector', function () {
//     return {
        
//         templateUrl: 'views/boat-trip-selector.html',
        // controller: [
        //     '$scope',
        //     function ($scope) {

        //     $scope.loading      = false;
        //     $scope.loadingTrips = false;
        //     $scope.errorUser    = false;
        //     $scope.changeset = {
        //         'delete': [],
        //         'update': []
        //     };

            // $rootScope.$watch('userData', function (newValue, oldValue) {
            //     if (newValue) {
            //         $scope.current_group = $rootScope.userData.group;
            //     }
            // });

            // $rootScope.$watch('apiRoot', function (newValue, oldValue) {
            //     if (newValue) {
            //         $scope.getBoats();
            //     }
            // });

            // $scope.$watch('currentBoat', function (newValue, oldValue) {
            //     if (newValue !== oldValue) {
            //         $scope.selectionTrip = {
            //             description: 'SELECT_DATE_OF_TRIP'
            //         };
            //         $scope.$emit('event:getBoatChartData', {
            //             boat: newValue
            //         });
            //     }
            // });

            // $scope.$watch('currentTrip', function (newValue, oldValue) {
            //     if (newValue !== oldValue) {
            //         $scope.$emit('event:getTripChartData', {
            //             trip: newValue
            //         });
            //     }
            // });

            // $scope.getBoats = function () {
            //     $scope.loading = true;
            //     apiService.GET($rootScope.apiRoot.boats).
            //     then(function (data) {
            //         $scope.loading = false;
            //         $scope.boats   = data.data;
            //     }, function (data) {
            //         $scope.loading    = false;
            //         $scope.errorUser = true;
            //         $scope.errorBoats = 'NO_BOATS_ASSIGNED';
            //         $scope.errorTrips = 'NO_TRIPS_ASSIGNED';
            //     });
            // };

            // $scope.selectBoat = function (boat) {
            //     $scope.currentBoat = boat;
            //     $scope.selectionBoat = boat;
            //     $scope.currentTrip = {
            //         description: 'SELECT_DATE_OF_TRIP'
            //     };
            //     $scope.getTrips(boat.amigo_id);
            // };

            // $scope.getTrips = function (amigoId) {
            //     $scope.loadingTrips = true;

            //     amigoId = typeof amigoId !== 'undefined' ? amigoId : null;

            //     if ($scope.currentBoat === amigoId) {
            //         $scope.loadingTrips = false;
            //         return;
            //     }

            //     $scope.currentBoat = amigoId;

            //     $scope.selectedItem = !!amigoId ? {
            //         'boat': amigoId
            //     } : {};

            //     var data = !!amigoId ? {
            //         'boat': amigoId
            //     } : null;
            //     $scope.trips = null;

            //     apiService.GET($rootScope.apiRoot.trips, data).
            //     then(function (data) {
            //         $scope.loadingTrips = false;
            //         $scope.trips        = data;
            //         // $scope.getBoatTripData();
            //         // $scope.getTripData($scope.currentTrip);
            //     }, function (data) {
            //         $scope.loadingTrips = false;
            //         $scope.errorTrips   = 'NO_TRIPS_ASSIGNED';
            //     });
            // };

            // $scope.selectTrip = function (trip) {
            //     $scope.currentTrip = trip;
            //     $scope.selectionTrip = trip;
            //     $scope.getBoatTripData();
            //     $scope.getTripData($scope.currentTrip.amigo_id);
            // };

            // $scope.getBoatTripData = function (boat) {
            //     boat = typeof boat !== 'undefined' ? boat : null;
            //     if (boat) {
            //         $scope.selectedItem = {
            //             'boat': boat
            //         };
            //     }
            // };

            // $scope.getTripData = function (amigoId) {
            //     $scope.$emit('event:loadingData', {value: true});
            //     $scope.currentTrip = amigoId;
            //     $scope.selectedItem.trip = amigoId;
            // };

            // $scope.selectOption = function (val, currentBoat) {

            //     $scope.loadingTrips = true;
            //     apiService.POST($rootScope.apiRoot.edit_trip, {
            //         'trip':       $scope.selectionTrip.amigo_id,
            //         'name':       $scope.selectionTrip.description,
            //         'changeset':  JSON.stringify($scope.changeset),
            //         'enabled':    $scope.selectionTrip.enabled,
            //         'sailed':     val,
            //         // 'revised_by': $scope.selectionTrip.revised,
            //     }).then(function (data) {
            //         $scope.currentBoat = currentBoat;
            //         $scope.selectionBoat = currentBoat;
            //         $scope.currentTrip = {
            //             description: 'SELECT_DATE_OF_TRIP'
            //         };
            //         $scope.selectionTrip = $scope.currentTrip;
            //         $scope.getTrips(currentBoat.amigo_id);
            //     });

            // };


            // $scope.revise = function (currentBoat) {

            //     $scope.loadingTrips = true;
            //     apiService.POST($rootScope.apiRoot.edit_trip, {
            //         'trip':       $scope.selectionTrip.amigo_id,
            //         'name':       $scope.selectionTrip.description,
            //         'changeset':  JSON.stringify($scope.changeset),
            //         'enabled':    $scope.selectionTrip.enabled,
            //         'sailed':     $scope.selectionTrip.sailed,
            //         'revised_by': $rootScope.userData.first_name + ' ' + $rootScope.userData.last_name,
            //     }).then(function (data) {
            //         $scope.currentBoat = currentBoat;
            //         $scope.selectionBoat = currentBoat;
            //         $scope.currentTrip = {
            //             description: 'SELECT_DATE_OF_TRIP'
            //         };
            //         $scope.selectionTrip = $scope.currentTrip;
            //         $scope.getTrips(currentBoat.amigo_id);
            //     });

            // };

//             }
//         ]
//     }
// });

'use strict';
angular.module('shellcatchApp.directives', [])

.directive('boatTripSelector', function() {
    return {
    // template: 'Name: {{customer.name}} Address: {{customer.address}}'
        // scope: {
        //         loading: '=',
        //         currentBoat: '=',
        //         selectionBoat: '=',
        //         boats: '=',
        //         currentTrip: '=',
        //         selectionTrip: '=',
        //         tripData: '=',
        //         tripPictures: '=',
        //         selectedItem: '='
        // },
        templateUrl: 'views/boat-trip-selector.html',
        controller: [
                '$scope',
                function ($scope) {

                $scope.loading      = false;
                $scope.loadingTrips = false;
                $scope.errorUser    = false;
                $scope.changeset = {
                    'delete': [],
                    'update': []
                };
            }
        ]
    }
});