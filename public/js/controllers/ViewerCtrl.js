// public/js/controllers/NerdCtrl.js
// angular.module('ViewerCtrl', []).controller('ViewerController', function($scope) {

//     $scope.tagline = 'Nothing beats a pocket protector!';

// });

'use strict';
angular.module('shellcatchApp.controllers', []).
controller('ViewerController',
           function ($scope) {
            $scope.tripData     = [];
            $scope.tripPictures = [];
            $scope.boatData     = [];
            $scope.view_add_turtle = false;
            //$scope.mode         = 'view';
            //$scope.pieChartType = 'pie';

            // $scope.group = $rootScope.group;

            // $rootScope.$watch('userData', function (newValue, oldValue) {
            //     if (newValue) {
            //         $scope.current_group = $rootScope.userData.group;

            //         $scope.name_combo_first = {
            //             'group_turtle': 'SELECT_BOAT',
            //             'group_coast': 'SELECT_COSTA',
            //             'group_origin': 'SELECT_BOAT'
            //         };

            //         $scope.name_combo_second = {
            //             'group_turtle': 'SELECT_DATE_OF_TRIP',
            //             'group_coast': 'SELECT_DATE',
            //             'group_origin': 'SELECT_DATE_OF_TRIP'
            //         };

            //         if ($scope.current_group == $scope.group.turtle) {
            //             $scope.selectionBoat = {name: $scope.name_combo_first.group_turtle};
            //             $scope.selectionTrip = {description: $scope.name_combo_second.group_turtle};
            //         } else if ($scope.current_group == $scope.group.coast) {
            //             $scope.selectionBoat = {name: $scope.name_combo_first.group_coast};
            //             $scope.selectionTrip = {description: $scope.name_combo_second.group_coast};
            //         }else if ($scope.current_group == $scope.group.origin) {
            //             $scope.selectionBoat = {name: $scope.name_combo_first.group_turtle};
            //             $scope.selectionTrip = {description: $scope.name_combo_second.group_turtle};
            //         }else if ($scope.current_group == $scope.group.all) {
            //             $scope.selectionBoat = {name: $scope.name_combo_first.group_turtle};
            //             $scope.selectionTrip = {description: $scope.name_combo_second.group_turtle};
            //         }
            //     }
            // });

            $scope.currentBoat;
            $scope.currentTrip;


            // $scope.$on('event:imageChanged', function (event, data) {
            //     $scope.$broadcast('event:pointChange', data);
            // });

            // $scope.$on('event:pointClick', function (event, data) {
            //     $scope.$broadcast('event:imageChange', data);
            // });


        }
        );
