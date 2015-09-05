controllers.controller('WaitlistsCtrl',function ($scope,$http,$location,$interval,$window,API,EveIGB,EveIMG,Notification,Minions,$cookieStore) {

    //=== Vars
    $scope.EveIGB = EveIGB;
    $scope.EveIMG = EveIMG;

    $scope.waitlists = {waitlists:[]};

    $scope.me = null;
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
                updateWaitlists();
                Notification.success("Successfully created waitlist")
            }, function () {
                Notification.error("Cannot create waitlist, logged in?")
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

    $scope.getWaitlistUrl = function (list) {
        var url = location.protocol + "//" + location.host + '/nemesis/waitlist.html?waitlistId=' + list.waitlistId;
        return url;
    }

    function updateWaitlists(){
        API.getWaitlists()
            .then(function (waitlists) {
                waitlists = waitlists.sort(function (listA, listB) {
                    return listB.lastActivityAt - listA.lastActivityAt;
                })
                $scope.waitlists = waitlists;
            })
    }
    //=== Fetch data
    // fetch it so the link is stored even if we are not logged in
    $scope.getWaitlistId();

    API.getMe()
        .then(function (data) {
            $scope.me = data;
            $scope.authenticated = true;
        })
        .then(null,function (status) {
            if(status==401){
                $scope.authenticated = false;
                Notification.error('Please login first');
            }
        })

    updateWaitlists();

});