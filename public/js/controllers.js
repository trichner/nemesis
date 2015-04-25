var app = angular.module('evewt', ['cgNotify']);
app.controller('wt-list',[ '$scope','$http','$location','$interval','$window','API','EveIGB','notify', function ($scope,$http,$location,$interval,$window,API,EveIGB,notify) {

    notify({
        message: 'Hello World',
        duration: 5000
    });
    //=== Vars
    $scope.waitlistVO = null;
    $scope.shipDNA = '';
    $scope.apiKey = '';
    $scope.apiVCode = '';
    $scope.remeberMe = true;

    $scope.authenticated = false;

    $scope.window = $window;

    $scope.postFit = function(){
        API.postFit($scope.waitlistVO.waitlistId,$scope.shipDNA)
            .then(function (data) {
                $scope.refreshWL();
            })
    };

    $scope.newWaitlist = function () {
        return API.newWaitlist()
            .then(function (waitlist) {
                $scope.updateWL(waitlist);
            })
    };

    //=== Functions
    $scope.updateWL = function(waitlistVO){
      $scope.waitlistVO = waitlistVO;
      $location.hash(waitlistVO.waitlistId);
    };

    $scope.refreshWL = function(){
        API.getWaitlist($scope.waitlistVO.waitlistId)
            .then(function (data) {
                $scope.updateWL(data);
            })
    };

    $scope.showCharInfo = function(item){
        EveIGB.showInfo(1377, item.characterId);
    };

    $scope.showFitting = function(item){
        EveIGB.showFitting(item.shipDNA);
    };

    $scope.showCorporation = function(item){
        EveIGB.showInfo(2,item.corporationId);
    };
    $scope.showAlliance = function(item){
        EveIGB.showInfo(16159,item.allianceId);
    };

    $scope.fleetInvite = function(item){
        EveIGB.inviteToFleet(item.characterId)
    };

    $scope.removeItem = function(item){
        API.removeItem(item.itemId)
            .then(function () {
                $scope.refreshWL();
            })
            .then(null,function () {
                console.log('failed to remove item :(');
            })
    };


    //=== Fetch data

    API.getMe()
        .then(function (data) {
            $scope.me = data;
            var waitlistId = $location.hash();
            $scope.authenticated = true;
            if(waitlistId && waitlistId.length>0){
                return API.getWaitlist(waitlistId)
                    .then(function (waitlist) {
                        $scope.updateWL(waitlist);
                    })
                    .then(null,function () {
                        $location.hash('');
                        console.log('Failed to fetch waitlist')
                    })
            }else{
                alert('Please either create a new waitlist or join an existing waitlist');
            }
        })
        .then(null,function (status) {
            if(status==401){
                $scope.authenticated = false;
            }
        })

    //update every 10s, veeery inefficient
    $interval(function(){
        $scope.refreshWL();
    }, 10000);
    //
}]);