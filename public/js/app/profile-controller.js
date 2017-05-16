webuiApp.controller('profileCtrl', ['$scope', '$http', '$window', '$timeout',  function ($scope, $http, $window, $timeout) {

    $scope.fbExists = true;
    $scope.googleExists = true;
    $scope.unlinkFbLoading = false;
    $scope.unlinkGoogleLoading = false;


    $http.get("/users/profile-info").then(function (response) {

        if (response.data) {
            $scope.profileInfo = response.data;

            if ($scope.profileInfo.fbtoken != '') {
                $scope.fbExists = false;
            }

            if ($scope.profileInfo.googletoken != '') {
                $scope.googleExists = false;
            }

        }


        $scope.unlinkFbToken = function () {

            $scope.unlinkFbLoading = true;
            var social = 'fb';

            if ($scope.profileInfo.fbtoken != '') {

                var data = $.param({
                    social: social,
                    token: $scope.profileInfo.fbtoken,
                    email: $scope.profileInfo.fbemail
                });

                $http.get('/users/unlink-social-token?' + data).then(function (response) {

                    if (response.data) {

                        if (response.data.status == true) {
                            $scope.profileInfo.fbname = '';
                            $scope.profileInfo.fbemail = '';
                            $scope.profileInfo.fbtoken = '';

                            $scope.fbTokenMessage = 'Facebook Token removed.';
                            $scope.fbExists = true;

                            if (response.data.logout == true) {

                                $timeout(function () {
                                    $scope.fbTokenMessage = 'Logging out the user';
                                    $window.location.href = '/users/logout';
                                }, 1000);
                            }

                        } else {
                            $scope.fbTokenMessage = 'Facebook Token not removed. Please try again.';
                        }

                        $scope.unlinkFbLoading = false;

                    }


                });

            }
        };


        $scope.unlinkGoogleToken = function () {

            $scope.unlinkGoogleLoading = true;
            var social = 'google';

            if ($scope.profileInfo.googletoken != '') {

                var data = $.param({
                    social: social,
                    token: $scope.profileInfo.googletoken,
                    email: $scope.profileInfo.googleemail
                });

                $http.get('/users/unlink-social-token?' + data).then(function (response) {

                    if (response.data) {

                        if (response.data.status == true) {
                            $scope.profileInfo.googlename = '';
                            $scope.profileInfo.googleemail = '';
                            $scope.profileInfo.googletoken = '';

                            $scope.googleTokenMessage = 'Google Token removed.';
                            $scope.googleExists = true;

                            if (response.data.logout == true) {

                                $timeout(function () {
                                    $scope.fbTokenMessage = 'Logging out the user';
                                    $window.location.href = '/users/logout';
                                }, 1000);
                            }

                        } else {
                            $scope.googleTokenMessage = 'Google Token not removed. Please try again.';
                        }

                        $scope.unlinkGoogleLoading = false;

                    }


                });
            }
        };

        $scope.profileChangePassword = function () {

            $scope.profilePasswordLoading = true;
            
            var data = $.param({
                email: $scope.profileInfo.email,
                oldpassword: $scope.poldpassword,
                password: $scope.pnewpassword
            });

            $http.get('/users/profile-change-password?' + data).then(function (response) {

                if (response.data) {

                    if (response.data.status == true) {

                        $scope.poldpassword = '';
                        $scope.pnewpassword = null;
                        $scope.pconfirmpassword = null;

                        $scope.profilepassword.$setPristine();
                        $scope.profilepassword.$setUntouched();

                        $scope.changePasswordMessage = 'Password changed.';

                    } else {
                        $scope.changePasswordMessage = 'Password not changed. Please try again.';
                    }

                    $scope.profilePasswordLoading = false;

                }
            });


        };
    });
}]);


