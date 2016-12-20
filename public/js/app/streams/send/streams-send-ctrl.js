webuiApp.controller('streamsSendCtrl', ['$scope', '$http', '$timeout', 'listPullStreamFactory', '$uibModal', function ($scope, $http, $timeout, listPullStreamFactory, $uibModal) {

    console.log('streamsSendCtrl loaded');


    //Default Values
    $scope.activeTab = '/send';

    $scope.seeAddedSendStream = false;

    $scope.default_option = true;
    $scope.pushStream = {
        protocol: 'rtmp',
        targetPort: 1935
    };
    // $scope.pushStream = {
    //     protocol: 'rtmp',
    //     targetPort: 1935,
    //     targetAddress: '13.84.150.76'
    // };

    console.log('streamsSendCtrl $scope.pushStream ' + JSON.stringify($scope.pushStream));

    //Get the List of Inbound Streams
    $scope.inboundList = [];
    listPullStreamFactory.updateListStreams().then(function (data) {
        //     .then(function(data){
        console.log('streamsSendCtrl output ' + JSON.stringify(data));

        //build the ui select list
        $scope.inboundList = data;
        $scope.inboundList.selected = $scope.inboundList[0];

        console.log('$scope.inboundList ' + JSON.stringify($scope.inboundList));
        console.log('$scope.inboundList.length '+$scope.inboundList.length );

        if($scope.inboundList.length < 1){
            $scope.streamsNotAvailable = true;
        }

    });


    $scope.changeProtocol = function () {
        console.log('changeProtocol changeProtocol');

        console.log('$scope.pushStream.protocol '+$scope.pushStream.protocol );

        if ($scope.pushStream.protocol == 'rtmp') {
            $scope.pushStream.targetPort = 1935;
        } else if ($scope.pushStream.protocol == 'rtsp') {
            $scope.pushStream.targetPort = 554;
        } else if ($scope.pushStream.protocol == 'mpegtstcp') {
            $scope.pushStream.targetPort = 5555;
        } else if ($scope.pushStream.protocol == 'mpegtsudp') {
            $scope.pushStream.targetPort = 5555;
        }

        console.log('$scope.pushStream ' + JSON.stringify($scope.pushStream));

    };

    $scope.setDefaultValuesSendStreamForm = function () {

        console.log('$scope.setDefaultValuesSendStreamForm $scope.setDefaultValuesSendStreamForm ');

        $scope.pushStream = {
            protocol: 'rtmp',
            targetPort: '',
            targetAddress: ''
        };
    };

    $scope.sendStream = function () {
        console.log('sendStream sendStream');

        if ($scope.inboundList.selected == null) {
            $scope.sendStreamLoading = false;
            $scope.invalidArgumentModal();
        } else {

            console.log('$scope.pushStream ' + JSON.stringify($scope.pushStream));
            console.log('$scope.inboundList.selected ' + JSON.stringify($scope.inboundList.selected));

            $scope.sendStreamLoading = true;

            var uri = null;

            if ($scope.pushStream.protocol == 'rtmp') {
                uri = $scope.pushStream.protocol + '://' + $scope.pushStream.targetAddress + '/live'
            } else {
                uri = $scope.pushStream.protocol + '://' + $scope.pushStream.targetAddress + ':' + $scope.pushStream.protocol
            }

            if($scope.pushStream.targetStreamName == ''){
                $scope.pushStream.targetStreamName = $scope.pushStream.inboundList.selected.name;
            }

            var parameters = {
                uri: uri,
                localStreamName: $scope.inboundList.selected.name,
                targetStreamName: $scope.pushStream.targetStreamName
            };


            console.log('parameters ' + JSON.stringify(parameters));

            var data = $.param({
                command: 'pushStream',
                parameters: $.param(parameters)
            });


            $http({
                method: 'POST',
                url: '/ems/api/execute-command',
                data: data,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function (response) {

                console.log('response ' + JSON.stringify(response));

                if (response.data.data != null || response.data.status == 'SUCCESS') {
                    $scope.seeAddedSendStream = true;
                    $scope.setDefaultValuesSendStreamForm();
                    // $scope.successMessage = response.data.description;
                } else {
                    $scope.invalidArgumentModal();
                }

                $scope.sendStreamLoading = false;

                // response['status'] = null;
                // delete response['status'];
                // response['config'] = null;
                // delete response['config'];
                // response['statusText'] = null;
                // delete response['statusText'];
                //
                // $scope.commandResponse = angular.toJson(response, 18);
            });

        }

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

}]);


webuiApp.controller('invalidArgumentModalCtrl', ['$scope', '$uibModalInstance', '$http', function ($scope, $uibModalInstance, $http) {

    // $scope.localStreamName = items;

    // $scope.delete = function () {
    //     console.log('confirmDeleteModalCtrl ok');
    //     // $uibModalInstance.dismiss('cancel');
    //
    //     $http.get("/ems/api/removeconfig?configid="+configId).then(function (response) {
    //
    //         console.log('response '+JSON.stringify(response));
    //
    //         $uibModalInstance.dismiss('cancel');
    //
    //     });
    //
    // };

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


