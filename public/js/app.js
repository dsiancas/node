// public/js/app.js
'use strict';

// angular.module('shellcatchApp.settings', []);
angular.module('shellcatchApp.directives', []);
angular.module('shellcatchApp.controllers', []);
// angular.module('shellcatchApp.services', []);

angular.module('shellcatchApp', [
	'ngRoute', 
	'appRoutes',
	'MainCtrl',
    // 'shellcatchApp.settings',
    'shellcatchApp.directives',
    'shellcatchApp.controllers',
    // 'shellcatchApp.services' 
    ]);

