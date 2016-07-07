// public/js/appRoutes.js
    angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $routeProvider

        // home page
        // nerds page that will use the NerdController
        .when('/viewer', {
            templateUrl: 'views/viewer.html',
            controller: 'ViewerController',
            name: 'viewer-ctrl'
        }).otherwise({
            redirectTo: '/viewer'
        });

    $locationProvider.html5Mode(true);

}]);