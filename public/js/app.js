var app = angular.module('app', ['ngRoute','nemesisControllers']);

app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/waitlists', {
                templateUrl: 'partials/waitlists.html',
                controller: 'WaitlistsCtrl'
            }).
            when('/waitlists/:waitlistId', {
                templateUrl: 'partials/waitlist.html',
                controller: 'WaitlistCtrl'
            }).
            otherwise({
                redirectTo: '/waitlists'
            });
    }]);