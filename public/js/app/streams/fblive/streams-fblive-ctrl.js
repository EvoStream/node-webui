webuiApp.controller('streamsFbLiveCtrl', ['$scope', '$http', '$timeout', 'listPullStreamFactory', '$uibModal', function ($scope, $http, $timeout, listPullStreamFactory, $uibModal) {

    console.log('streamsFbLiveCtrl loaded');

    $scope.activeTab = '/fblive';


    $scope.seeFbForm = false;


    $http.get('/users/check-fb-login').then(function (response) {


        console.log('response ' + JSON.stringify(response));

        console.log('response.data.status ' + response.data.status);

        if (response.data.status == 'login') {

            $scope.seeFbForm = true;

            /*
             * Default Values
             */

            $scope.seeAddedSendStream = false;
            $scope.fbButtonText = 'Send Stream to Facebook Video';

            //Get the List of Inbound Streams
            $scope.fbInboundList = [];
            listPullStreamFactory.updateListStreams().then(function (data) {
                console.log('streamsSendCtrl output ' + JSON.stringify(data));

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
                    value: "FRIENDS",
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
                    text: "User"
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
                console.log('$scope.fbEdge.default.selected '+ JSON.stringify($scope.fbEdge.default.selected));

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

                        console.log('response '+ JSON.stringify(response));
                        if(response.data){
                            $scope.fbInfo = JSON.parse(response.data);

                            $scope.fbUserId = $scope.fbInfo.id;

                            console.log('$scope.fbInfo '+$scope.fbInfo );
                            console.log('$scope.fbInfo '+ JSON.stringify($scope.fbInfo));
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


                        console.log('response '+ JSON.stringify(response));

                        if(response.data){
                            $scope.activeEdge = targetEdge;

                            $scope.fbInfo = JSON.parse(response.data);

                            console.log('$scope.fbInfo '+$scope.fbInfo );
                            console.log('$scope.fbInfo.data '+ JSON.stringify($scope.fbInfo.data));
                            console.log('$scope.fbInfo.data[1] '+ JSON.stringify($scope.fbInfo.data[1]));

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

                console.log('response '+ JSON.stringify(response));
                if(response.data){
                    $scope.fbInfo = JSON.parse(response.data);

                    $scope.fbUserId = $scope.fbInfo.id;
                    console.log('$scope.fbInfo '+$scope.fbInfo );
                    console.log('$scope.fbInfo '+ JSON.stringify($scope.fbInfo));
                }

            });


            $scope.setToDefaultValuesFbStreamForm = function () {
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

                console.log('sendFacebookStream sendFacebookStream ');

                $scope.sendFacebookStreamLoading = true;
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

                console.log('edgeId '+ edgeId);

                console.log('$scope.fbUserId '+ $scope.fbUserId);
                console.log('$scope.fbPageId '+ $scope.fbPageId);

                var parameters = {
                    description: $scope.fbDescription,
                    privacyStatus: $scope.fbPrivacyStatus.selected.value,
                    edge: $scope.activeEdge,
                    edgeId: edgeId
                };

                console.log('parameters '+ JSON.stringify(parameters));
                console.log('$scope.fbInboundList.selected.name '+ $scope.fbInboundList.selected.name);
                console.log('$scope.fbProtocol '+$scope.fbProtocol );

                var data = $.param({
                    localStreamName: $scope.fbInboundList.selected.name,
                    protocol: $scope.fbProtocol,
                    parameters: $.param(parameters)
                });


                $http.get('/ems/api/send-facebook?' + data).then(function (response) {

                    console.log('response ' + JSON.stringify(response));

                    $scope.seeAddedSendStream = false;
                    $scope.fbButtonText = 'Send Stream to Facebook Video';

                    if (response.data.status){

                        $scope.seeAddedSendStream = true;
                        $scope.setToDefaultValuesFbStreamForm();

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
                    // $ctrl.selected = selectedItem;
                    // $scope.sendStreamLoading = false;
                }, function () {
                    // $log.info('Modal dismissed at: ' + new Date());
                    $scope.sendStreamLoading = false;
                });
            };


        }

        // // else{
        // //     $scope.seeYtForm = false;
        // // }
        //
        // console.log('01 LAST $scope.seeYtForm ' + $scope.seeYtForm);




    });




}]);


webuiApp.controller('invalidArgumentModalCtrl', ['$scope', '$uibModalInstance', '$http', function ($scope, $uibModalInstance, $http) {

    $scope.ok = function () {
        console.log('invalidArgumentModalCtrl ok');
        $scope.sendStreamLoading = false;
        $uibModalInstance.dismiss('ok');
    };

    $scope.cancel = function () {
        console.log('invalidArgumentModalCtrl cancel');
        $scope.sendStreamLoading = false;
        $uibModalInstance.dismiss('cancel');
    };

}]);

