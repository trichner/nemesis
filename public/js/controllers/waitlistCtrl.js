controllers.controller('WaitlistCtrl',function ($scope,$http,$location,$interval,$routeParams,$window,API,EveIGB,EveIMG,Notification,Minions) {

    $scope.EveIGB = EveIGB;
    $scope.EveIMG = EveIMG;

    $scope.waitlistId = $routeParams.waitlistId;

    //=== Vars
    $scope.waitlistVO = null;
    $scope.waitlists = {waitlists:[]};
    $scope.shipDNA = '';

    $scope.stats = '';

    var RoleID = {
        DD : 'DD',
        L4 : 'L4',
        L5 : 'L5',
        P : 'P',
        SH : 'SH',
        OGB : 'OGB'
    }

    var eveMail = {
        "subject" : "Bad Fitting",
        "body" : "Your fit is bad and you should feel bad!"
    };

    $scope.roles = [
        {name: 'DD',     type: 'Damage Dealer', id:RoleID.DD},
        {name: 'Logi4',  type: 'Logistics' , id:RoleID.L4},
        {name: 'Logi5',  type: 'Logistics' , id:RoleID.L5},
        {name: 'Scout/Hacker',    type: 'Off-grid', id:RoleID.SH},
        {name: 'Picket', type: 'Off-grid', id:RoleID.P},
        {name: 'OGB',    type: 'Off-grid', id:RoleID.OGB}
    ]

    $scope.mRole = $scope.roles[0]

    $scope.authenticated = false;
    $scope.isIGB = (typeof CCPEVE !== 'undefined');
    console.log('You are' + ($scope.isIGB ? '' : ' not') + ' in Eve IGB')
    $scope.window = $window;

    $scope.isOwner = function () {
        if(!$scope.waitlistVO){
            return false;
        }
        return $scope.waitlistVO.ownerId == $scope.me.characterId;
    }

    $scope.forwardMe = function(){
        
    }

    $scope.isItemOwner = function(item) {
        if(!$scope.waitlistVO){
            return false;
        }
        return $scope.waitlistVO.ownerId == item.characterId;
    }

    $scope.postFit = function(){
        API.postFit($scope.waitlistVO.waitlistId,$scope.shipDNA,$scope.mRole.id)
            .then(function (data) {
                $scope.refreshWL();
                Notification.success("Successfully x-ed up")
                $scope.shipDNA = '';
            }, function () {
                Notification.error("Cannot x up, logged in? on waitlist?")
            })
    };

    $scope.newWaitlist = function () {
        return API.newWaitlist()
            .then(function (waitlist) {
                $scope.updateWL(waitlist);
                Notification.success("Successfully created waitlist")
            }, function () {
                Notification.error("Cannot create waitlist, logged in?")
            })
    };

    //=== Functions
    $scope.updateWL = function(waitlistVO){
        $scope.waitlistVO = waitlistVO;
        $scope.stats = Minions.waitlistStatsTxt(waitlistVO);
    };

    $scope.refreshWL = function(){
        API.getWaitlist($scope.waitlistVO.waitlistId)
            .then(function (data) {
                $scope.updateWL(data);
            })
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

    $scope.canRemove = function (characterId) {
        return ($scope.isOwner() || characterId==$scope.me.characterId);
    }

    $scope.getWaitlistUrl = function () {
        var waitlistId = $scope.waitlistId;
        var url;
        if(waitlistId && waitlistId.length){
            url = '#/waitlists/' + waitlistId;
        }else{
            url = '';
        }
        return url;
    }

    $scope.updateName = function(name){
        API.updateName($scope.waitlistVO.waitlistId,name)
            .then(function (data) {
                $scope.updateWL(data);
                Notification.success("Updated name")
                return false;
            })
            .then(null,function () {
                Notification.error('failed to update name :(');
                return false;
            })
    }


    $scope.createTimer = function(item){
        Minions.createTimer(this, new Date());
    }

    //=== Fetch data
    // fetch it so the link is stored even if we are not logged in

    API.getMe()
        .then(function (data) {
            $scope.me = data;
            $scope.authenticated = true;
            return $scope.waitlistId;
        })
        .then(function (waitlistId) {
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
                return new Error('Not on a waitlist.');
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

    //update every 10s, kinda inefficient
    $interval(function(){
        $scope.refreshWL();
    }, 10000);
});