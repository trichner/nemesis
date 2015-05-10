var app = angular.module('evewt', ['ui-notification']);
app.controller('testing',[ '$scope','$http','$location','$interval','$window','API','EveIGB','Notification','Minions',function ($scope,$http,$location,$interval,$window,API,EveIGB,Notification,Minions) {

    $scope.isIGB = (typeof CCPEVE !== 'undefined');
    console.log('You are' + ($scope.isIGB ? '' : ' not') + ' in Eve IGB')

    $scope.window = $window;

    $scope.list = [
        {id:'1'},
        {id:'2'},
        {id:'3'},
        {id:'4'},
        {id:'5'}
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

}]);