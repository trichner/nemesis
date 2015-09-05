controllers.controller('MainCtrl',function ($scope,$http,$location,$interval,$window,EveIGB,EveIMG,API,Notification) {

    $scope.me = null;
    $scope.authenticated = false;

    $scope.EveIGB = EveIGB;
    $scope.EveIMG = EveIMG;

    $scope.logout = function () {
        API.logout()
            .then(function () {
                Notification.success("Logged out")
            })
            .then(null,function () {
                Notification.error('failed to logout :(');
            })
    }

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
});