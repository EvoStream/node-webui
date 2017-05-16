webuiApp.controller('streamsFbLiveCtrl', ['$scope', '$http', '$timeout', 'listPullStreamFactory', '$uibModal', function ($scope, $http, $timeout, listPullStreamFactory, $uibModal) {

    $scope.activeTab = '/fblive';
    $scope.seeFbForm = false;

    $http.get('/users/check-fb-login').then(function (response) {

        if (response.data.status == 'login') {

            $scope.seeFbForm = true;
            $scope.sendFacebookStreamLoading = false;

            /*
             * Default Values
             */

            $scope.seeAddedSendStream = false;
            $scope.disableSelectStreamFb = false;
            $scope.fbButtonText = 'Post to Facebook';

            //Get the List of Inbound Streams
            $scope.fbInboundList = [];
            listPullStreamFactory.updateListStreams().then(function (data) {

                //build the ui select list
                $scope.fbInboundList = data;
                $scope.fbInboundList.selected = $scope.fbInboundList[0];

                if($scope.fbInboundList.length < 1){
                    $scope.streamsNotAvailable = true;
                }
            });

            //Dropdown List for Privacy Status
            $scope.fbPrivacyStatus = [
                {
                    value: "SELF",
                    text: "Only Me",
                    description: "Only you can see the video"
                },
                {
                    value: "ALL_FRIENDS",
                    text: "Friends",
                    description: "Only share the video with your Facebook friends"
                },
                {
                    value: "FRIENDS_OF_FRIENDS",
                    text: "Friends of Friends",
                    description: "A friend of one of your Facebook friends can see the video"
                },
                {
                    value: "EVERYONE",
                    text: "Public",
                    description: "Anyone on or off Facebook can see your video"
                }
            ];
            // Set default value for Privacy Status
            $scope.fbPrivacyStatus.selected = $scope.fbPrivacyStatus[0];
            $scope.fbUserId = '';

            // var edgeUser = angular.element( document.querySelector( '#fb-edge-user' ) );
            // edgeUser.addClass('active');

            /*
             * Dropdown
             */

            $scope.fbEdgeList = [
                {
                    value: "user",
                    text: "User Timeline"
                },
                {
                    value: "page",
                    text: "Page"
                },
                {
                    value: "event",
                    text: "Event"
                },
                {
                    value: "group",
                    text: "Group"
                },
            ];

            $scope.fbEdge = {
                "list": $scope.fbEdgeList,
                "default": {
                    selected: $scope.fbEdgeList[0]
                },
            };

            $scope.selectedFbEdge = function () {

                var parameters = null;
                var data = null;
                var targetEdge = $scope.fbEdge.default.selected.value;

                $scope.activeEdge = targetEdge;


                if(targetEdge == 'user'){
                    //show reminder
                    parameters = {
                        edge: targetEdge
                    };

                    data = $.param({
                        parameters: $.param(parameters)
                    });

                    $http.get('/ems/api/get-fb-edge?' + data).then(function (response) {

                        if(response.data){
                            $scope.fbInfo = JSON.parse(response.data);

                            $scope.fbUserId = $scope.fbInfo.id;
                        }

                    });

                } else {
                    parameters = {
                        edge: targetEdge
                    };

                    data = $.param({
                        parameters: $.param(parameters)
                    });

                    $http.get('/ems/api/get-fb-edge?' + data).then(function (response) {

                        if(response.data){
                            $scope.activeEdge = targetEdge;

                            $scope.fbInfo = JSON.parse(response.data);

                            if($scope.activeEdge == 'page'){
                                $scope.fbPageId = $scope.fbInfo.data[0].id;
                            }else if($scope.activeEdge == 'event'){
                                $scope.fbEventId = $scope.fbInfo.data[0].id;
                            }else if($scope.activeEdge == 'group'){
                                $scope.fbGroupId = $scope.fbInfo.data[0].id;
                            }
                        }

                    });

                }

            };

                //Load Default User Info
            $scope.activeEdge = 'user';
            var parameters = {
                edge: $scope.activeEdge
            };

            var data = $.param({
                parameters: $.param(parameters)
            });

            //Load Default Protocol
            $scope.fbProtocol = 'rtmp';

            $scope.fbInfo = null;

            $http.get('/ems/api/get-fb-edge?' + data).then(function (response) {

                if(response.data){
                    $scope.fbInfo = JSON.parse(response.data);

                    $scope.fbUserId = $scope.fbInfo.id;
                }

            });


            $scope.setToDefaultValuesFbStreamForm = function () {

                $scope.seeAddedSendStream = false;

                $scope.fbInboundList.selected = $scope.fbInboundList[0];
                $scope.fbPrivacyStatus.selected = $scope.fbPrivacyStatus[0];
                $scope.fbEdge = {
                    "list": $scope.fbEdgeList,
                    "default": {
                        selected: $scope.fbEdgeList[0]
                    },
                };
                $scope.activeEdge = 'user'
                $scope.fbDescription = '';
            };

            $scope.sendFacebookStream = function() {


                $scope.sendFacebookStreamLoading = true;
                $scope.disableSelectStreamFb = true;
                $scope.seeAddedSendStream = false;
                $scope.fbButtonText = 'Sending.... ';

                var edgeId = null;

                if($scope.activeEdge == 'user'){
                    edgeId = $scope.fbUserId;
                }else if($scope.activeEdge == 'page'){
                    edgeId = $scope.fbPageId;
                }else if($scope.activeEdge == 'event'){
                    edgeId = $scope.fbEventId;
                }else if($scope.activeEdge == 'group'){
                    edgeId = $scope.fbGroupId;
                }

                var parameters = {
                    description: $scope.fbDescription,
                    privacyStatus: $scope.fbPrivacyStatus.selected.value,
                    edge: $scope.activeEdge,
                    edgeId: edgeId
                };

                var data = $.param({
                    localStreamName: $scope.fbInboundList.selected.name,
                    protocol: $scope.fbProtocol,
                    parameters: $.param(parameters)
                });


                $http.get('/ems/api/send-facebook?' + data).then(function (response) {

                    $scope.seeAddedSendStream = false;
                    $scope.disableSelectStreamFb = false;
                    $scope.fbButtonText = 'Post to Facebook';
                    $scope.sendFacebookStreamLoading = false;

                    if (response.data.status){

                        $scope.setToDefaultValuesFbStreamForm();
                        $scope.seeAddedSendStream = true;

                    } else {
                        $scope.invalidArgumentModal();
                    }

                });
            };


            $scope.invalidArgumentModal = function () {

                var modalInstance = $uibModal.open({
                    templateUrl: 'js/app/streams/send/modals/invalid-params-streams-send.html',
                    controller: 'invalidArgumentModalCtrl',
                    resolve: {
                        sendStreamLoading: function () {
                            return $scope.sendStreamLoading;
                        }
                    }
                });

                modalInstance.result.then(function () {
                }, function () {
                    $scope.sendStreamLoading = false;
                });
            };


        }

    });




}]);


webuiApp.controller('invalidArgumentModalCtrl', ['$scope', '$uibModalInstance', '$http', function ($scope, $uibModalInstance, $http) {

    $scope.ok = function () {
        $scope.sendStreamLoading = false;
        $uibModalInstance.dismiss('ok');
    };

    $scope.cancel = function () {
        $scope.sendStreamLoading = false;
        $uibModalInstance.dismiss('cancel');
    };

}]);

