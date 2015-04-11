var evewt = angular.module('evewt', []);

evewt.controller('wt-list',[ '$scope','$http','$location','$interval', function ($scope,$http,$location,$interval) {
  if(typeof CCPEVE == 'undefined'){
    alert('CCPEVE not defined, please use the EVE Online in-game-browser.');
    return;
  }

    //=== Vars

    $scope.waitlistVO = null;

    $scope.shipDNA = "";

    $scope.apiKey = '';
    $scope.apiVCode = '';


    $scope.postFit = function(){
        $http.post('api/waitlist/'+$scope.waitlistVO.waitlistId,{shipString:$scope.shipDNA}).success(function(data){
            $scope.refreshWL();
        });
    };

    $scope.verifyPilot = function () {
        $http.post('api/verify',{key:$scope.apiKey, vCode:$scope.apiVCode}).success(function(data){
            $scope.refreshWL();
        });
    };



    //=== Functions
    $scope.updateWL = function(waitlistVO){
      $scope.waitlistVO = waitlistVO;
      $location.search('waitlistId',waitlistVO.waitlistId);
    };

    $scope.refreshWL = function(){
      $http.get('api/waitlist/'+$scope.waitlistVO.waitlistId)
      .success(function(waitlistVO){
          $scope.updateWL(waitlistVO);
      });
    };

    $scope.showCharInfo = function(item){
      CCPEVE.showInfo(1377, item.characterId);
    };

    $scope.showFitting = function(item){
     CCPEVE.showFitting(item.shipDNA);
    };

    $scope.fleetInvite = function(item){
        CCPEVE.inviteToFleet(item.characterId)
    };

    $scope.removeItem = function(item){
        // hack since DELETE is a keyword
        $http({
            method: 'DELETE',
            url: 'api/waitlist/'+$scope.waitlistVO.waitlistId,
            data: {itemId:item.itemId},
            headers: {'content-type':'application/json'}
        }).
        success(function(data){
            $scope.refreshWL();
        }).
        error(function(data, status, headers, config) {
            //if it failed fetch our own list
            alert('failed to remove item :(');
        });
    };


    //=== Fetch data

    $http.get('api/me').success(function(data){
        $scope.me = data;
        var waitlistId = $location.search()['waitlistId'];

        if(!waitlistId || 0 === waitlistId.length){
            $http.post('api/waitlist').success(function(waitlistVO){
               $scope.updateWL(waitlistVO);
            });
        }else{
            $http.get('api/waitlist/'+waitlistId).success(function(waitlistVO){
                $scope.updateWL(waitlistVO);
            }).
            error(function(data, status, headers, config) {
                //if it failed fetch our own list
                $http.get('api/waitlist').success(function(waitlistVO){
                    $scope.updateWL(waitlistVO);
                });
            });
        }
    }).
    error(function(data, status, headers, config) {
    //if it failed fetch our own list
         alert("I'm sowwy, something went terribly wrong");
    });

    //update all 10s, veeery inefficient
    $interval(function(){
        $scope.refreshWL();
    }, 10000);
    //
}]);