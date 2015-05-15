var app = angular.module('testapp', ['ui-notification']);
app.controller('testing',[ '$scope','$http','$location','$interval','$window','API','EveIGB','Notification','Minions',function ($scope,$http,$location,$interval,$window,API,EveIGB,Notification,Minions) {

    $scope.isIGB = (typeof CCPEVE !== 'undefined');
    console.log('You are' + ($scope.isIGB ? '' : ' not') + ' in Eve IGB')

    $scope.window = $window;

    $scope.fittings = [
        {role:'DD',shipType:17736,startDate:1234},
        {role:'L4',shipType:17736,startDate:6544},
        {role:'SH',shipType:17736,startDate:7854},
        ]

    var now = new Date();
    $scope.list = [
        {id:'1',startDate:new Date(now-4312)},
        {id:'2',startDate:new Date(now-65344)},
        {id:'3',startDate:new Date(now-7854)},
        {id:'4',startDate:new Date(now-18554)},
        {id:'5',startDate:new Date() - 88885}
    ]

    $scope.onItemClick = function (item) {
        console.log('Clicked: ' + item.id)
    }

    $scope.onSafetyClick = function (item) {
        console.log("Safety off: " + item.id)
        angular.element(this).addClass('removed');

    }

    $scope.onClick = function(){
        var safety = true;

        return function(item){
            if(!safety){
                console.log('Safety OFF firing: ' + item.id)
            }else{
                console.log('Safety ON, now offlining: ' + item.id)

            }
            safety = false;
        }
    }();

    Minions.createTimer('timer',new Date())

}]);