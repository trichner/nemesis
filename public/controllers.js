var evewt = angular.module('evewt', []);

evewt.controller('wt-list',[ '$scope','$http','$location','$interval', function ($scope,$http,$location,$interval) {
  if(typeof CCPEVE == 'undefined'){
    alert('CCPEVE not defined, please use the EVE Online in-game-browser.');
    return;
  }

    //=== Vars

    $scope.waitlistVO = null;

    $scope.shipDNA = "";

    //=== Functions
    $scope.updateWL = function(waitlistVO){
      $scope.waitlistVO = waitlistVO;
      $location.search('waitlistId',waitlistVO.waitlistId);
    };

    $scope.refreshWL = function(){
      $http.get('rest/v1/wl/id/'+$scope.waitlistVO.waitlistId)
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
            url: 'rest/v1/wl/id/'+$scope.waitlistVO.waitlistId,
            data: item.itemId
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

    $http.get('rest/v1/character/me').success(function(data){
        $scope.me = data;
        var waitlistId = $location.search()['waitlistId'];

        if(!waitlistId || 0 === waitlistId.length){
            $http.get('rest/v1/wl/me').success(function(waitlistVO){
               $scope.updateWL(waitlistVO);
            });
        }else{
            $http.get('rest/v1/wl/id/'+waitlistId).success(function(waitlistVO){
                $scope.updateWL(waitlistVO);
            }).
            error(function(data, status, headers, config) {
                //if it failed fetch our own list
                $http.get('rest/v1/wl/me').success(function(waitlistVO){
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

    $scope.postFit = function(){
        $http.post('rest/v1/wl/id/'+$scope.waitlistVO.waitlistId,$scope.shipDNA).success(function(data){
            $scope.refreshWL();
        });
    };
}]);