var app = angular.module('evewt', []);
app.controller('wt-list',[ '$scope','$http','$location','$interval','$window','API', function ($scope,$http,$location,$interval,$window,API) {
  if(typeof CCPEVE == 'undefined'){
    alert('CCPEVE not defined, please use the EVE Online in-game-browser.');
    return;
  }

    //=== Vars
    $scope.waitlistVO = null;
    $scope.shipDNA = '';
    $scope.apiKey = '';
    $scope.apiVCode = '';
    $scope.remeberMe = true;

    $scope.window = $window;

    $scope.postFit = function(){
        API.postFit($scope.waitlistVO.waitlistId,$scope.shipDNA)
            .then(function (data) {
                $scope.refreshWL();
            })
    };

    $scope.verifyPilot = function () {
        API.verify($scope.apiKey,$scope.apiVCode,$scope.rememberMe)
            .then(function () {
                $scope.refreshWL();
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
      CCPEVE.showInfo(1377, item.characterId);
    };

    $scope.showFitting = function(item){
     CCPEVE.showFitting(item.shipDNA);
    };

    $scope.showCorporation = function(item){
        CCPEVE.showInfo(2,item.corporationId);
    };
    $scope.showAlliance = function(item){
        CCPEVE.showInfo(16159,item.allianceId);
    };

    $scope.fleetInvite = function(item){
        CCPEVE.inviteToFleet(item.characterId)
    };

    $scope.removeItem = function(item){
        API.removeItem(item.itemId)
            .then(function () {
                $scope.refreshWL();
            })
            .then(null,function () {
                alert('failed to remove item :(');
            })
    };


    //=== Fetch data

    API.getMe()
        .then(function (data) {
            $scope.me = data;
            var waitlistId = $location.hash();

            if(!waitlistId || 0 === waitlistId.length){
                return API.newWaitlist()
                    .then(function (waitlist) {
                        $scope.updateWL(waitlist);

                        alert($location.absUrl())
                        window.location.href = $location.absUrl();
                    })
            }else{
                return API.getWaitlist(waitlistId)
                    .then(function (waitlist) {
                        $scope.updateWL(waitlist);
                    })
                    .then(null,function () {
                        return API.newWaitlist()
                            .then(function (waitlist) {
                                $scope.updateWL(waitlist);
                            })
                    })
            }
        })
        .then(null,function () {
            alert("I'm sowwy, something went terribly wrong");
        })

    //update all 10s, veeery inefficient
    $interval(function(){
        $scope.refreshWL();
    }, 10000);
    //
}]);