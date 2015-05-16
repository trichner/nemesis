var app = angular.module('evewt', ['ui-notification','ngCookies']);
app.controller('home',[ '$scope','$http','$location','$interval','$window','API','EveIGB','Notification','Minions','$cookieStore',function ($scope,$http,$location,$interval,$window,API,EveIGB,Notification,Minions,$cookieStore) {

    //=== Vars
    $scope.waitlists = {waitlists:[]};

    $scope.authenticated = false;

    $scope.isIGB = (typeof CCPEVE !== 'undefined');
    console.log('You are' + ($scope.isIGB ? '' : ' not') + ' in Eve IGB')

    $scope.window = $window;

    $scope.getWaitlistId = function () {
        var waitlistId = Minions.getQueryParam('waitlistId');
        if(waitlistId){
            $cookieStore.put('waitlistId',waitlistId);
        }else{
            waitlistId = $cookieStore.get('waitlistId');
        }
        return waitlistId;
    }

    $scope.isOwner = function () {
        return $scope.waitlistVO.ownerId == $scope.me.characterId;
    }

    $scope.forwardMe = function(){
        
    }

    $scope.isItemOwner = function(item) {
        return $scope.waitlistVO.ownerId == item.characterId;
    }

    $scope.newWaitlist = function () {
        return API.newWaitlist()
            .then(function (waitlist) {
                $scope.updateWL(waitlist);
                Notification.success("Successfully created waitlist")
            }, function () {
                Notification.error("Cannot create waitlist, logged in?")
            })
    };

    $scope.showCharInfo = function(item){
        EveIGB.showInfo(1377, item.characterId);
    };

    $scope.showCorporation = function(item){
        EveIGB.showInfo(2,item.corporationId);
    };
    $scope.showAlliance = function(item){
        EveIGB.showInfo(16159,item.allianceId);
    };

    $scope.logout = function () {
        API.logout()
            .then(function () {
                Notification.success("Logged out")
            })
            .then(null,function () {
                Notification.error('failed to logout :(');
            })
    }

    $scope.getWaitlistUrl = function () {
        var waitlistId = $scope.getWaitlistId();
        var url;
        if(waitlistId && waitlistId.length){
            url = location.protocol + "//" + location.host + location.pathname + '?waitlistId=' + waitlistId;
        }else{
            url = '';
        }
        return url;
    }

    //=== Fetch data
    // fetch it so the link is stored even if we are not logged in
    $scope.getWaitlistId();

    API.getMe()
        .then(function (data) {
            $scope.me = data;
            var waitlistId = $scope.getWaitlistId();
            $scope.authenticated = true;
            if(waitlistId && waitlistId.length>0){
                return API.getWaitlist(waitlistId)
                    .then(function (waitlist) {
                        $scope.updateWL(waitlist);
                        Notification.success('Joined waitlist');
                    })
                    .then(null,function () {
                        Notification.error('Failed to fetch waitlist :(');
                    })
            }else{
                // Stay on home, need waitlist firs
            }
        })
        .then(null,function (status) {
            if(status==401){
                $scope.authenticated = false;
                Notification.error('Please login first');
            }
        })

    API.getWaitlists()
        .then(function (waitlists) {
            $scope.waitlists = waitlists;
        })

    //update every 10s, veeery inefficient
    $interval(function(){
        $scope.refreshWL();
    }, 10000);
    //
}]);