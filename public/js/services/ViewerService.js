// public/js/services/NerdService.js
angular.module('ViewerService', []).factory('Viewer', ['$http', function($http) {

    // return {
    //     // call to get all nerds
    //     get : function() {
    //         return $http.get('/api/boats');
    //     },


    //     // these will work when more API routes are defined on the Node side of things
    //     // call to POST and create a new nerd
    //     create : function(boatData) {
    //         return $http.post('/api/boats', boatData);
    //     },

    //     // call to DELETE a nerd
    //     delete : function(id) {
    //         return $http.delete('/api/boats/' + id);
    //     }
    // }       

}]);