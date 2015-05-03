var app = angular.module('evewt', ['ui-notification']);
app.controller('wt-list',[ '$scope','$http','$location','$interval','$window','API','EveIGB','Notification','Minions',function ($scope,$http,$location,$interval,$window,API,EveIGB,Notification,Minions) {

    //=== Helpers

    function getQueryParam(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    //=== Vars
    $scope.waitlistVO = null;
    $scope.waitlists = {waitlists:[]};
    $scope.shipDNA = '';
    $scope.apiKey = '';
    $scope.apiVCode = '';
    $scope.remeberMe = true;

    $scope.asciiHead = '-== VG Fleet ==-';
    $scope.asciiFoot = '-==          ==-';
    $scope.waitlistTxt = '';

    $scope.authenticated = false;
    $scope.isIGB = (typeof CCPEVE !== 'undefined');
    console.log('You are' + ($scope.isIGB ? '' : ' not') + ' in Eve IGB')
    $scope.window = $window;

    $scope.getWaitlistId = function () {
        var waitlistId = getQueryParam('waitlistId');
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

    $scope.postFit = function(){
        API.postFit($scope.waitlistVO.waitlistId,$scope.shipDNA)
            .then(function (data) {
                $scope.refreshWL();
                Notification.success("Successfully x-ed up")
            }, function () {
                Notification.error("Cannot x up, logged in? on waitlist?")
            })
    };

    $scope.newWaitlist = function () {
        return API.newWaitlist()
            .then(function (waitlist) {
                waitlist.waitlistId;
                $scope.updateWL(waitlist);
                Notification.success("Successfully created waitlist")
            }, function () {
                Notification.error("Cannot create waitlist, logged in?")
            })
    };

    //=== Functions
    $scope.updateWL = function(waitlistVO){
        $scope.waitlistVO = waitlistVO;
        // add ascii list
        var tmplist = $scope.asciiHead;
        tmplist = tmplist.concat(Minions.waitlist2ascii(waitlistVO));
        tmplist = tmplist.concat($scope.asciiFoot);
        $scope.waitlistTxt = tmplist;
    };

    $scope.refreshWL = function(){
        API.getWaitlist($scope.waitlistVO.waitlistId)
            .then(function (data) {
                $scope.updateWL(data);
            })
        /*
        API.getWaitlistTxt($scope.waitlistVO.waitlistId)
            .then(function (waitlistTxt) {
                $scope.waitlistTxt = waitlistTxt;
            })
            */
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
        Notification.success("Invited " + item.characterName + " to fleet")
    };

    $scope.makeBoss = function(item){
        API.makeBoss($scope.waitlistVO.waitlistId,item.characterId)
            .then(function () {
                Notification.success("Made " + item.characterName + " waitlist manager")
            }, function () {
                Notification.error('Failed to make ' + item.characterName + ' boss');
            })
    };

    $scope.removeItem = function(item){
        API.removeItem($scope.waitlistVO.waitlistId,item.itemId)
            .then(function () {
                $scope.refreshWL();
                Notification.success("Removed " + item.characterName + " from the waitlist")
            })
            .then(null,function () {
                Notification.error('failed to remove item :(');
            })
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


    //=== Fetch data

    API.getMe()
        .then(function (data) {
            $scope.me = data;
            var waitlistId = $scope.getWaitlistId(); //$location.hash();
            $scope.authenticated = true;
            if(waitlistId && waitlistId.length>0){
                return API.getWaitlist(waitlistId)
                    .then(function (waitlist) {
                        $scope.updateWL(waitlist);
                        Notification.success('Joined waitlist');
                    })
                    .then(null,function () {
                        $location.hash('');
                        Notification.error('Failed to fetch waitlist :(');
                    })
            }else{
                alert('Please either create a new waitlist or join an existing waitlist');
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