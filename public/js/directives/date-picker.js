'use strict';
angular.module('shellcatchApp.directives').
directive('datePicker', function () {
    return {
        scope: {
            ngModel: '=',
            format: '=?'
        },
        controller: ['$scope', '$element',
        function ($scope, $element) {
            $scope.format = angular.isDefined($scope.format) ? $scope.format : 'DD-MM-YYYY';

            $element.datetimepicker({
                format: $scope.format,
                toolbarPlacement: 'top',
                showTodayButton: true,
                icons: {
                    time: "fa fa-clock-o",
                    date: "fa fa-calendar",
                    up: "fa fa-caret-up",
                    down: "fa fa-caret-down",
                    today: 'fa fa-hand-o-up',
                }
            });

            $element.on('dp.change', function (e) {
                $scope.$apply(function () {
                    $scope.ngModel = e.date.format($scope.format);
                });
            });
        }]
    };
});
