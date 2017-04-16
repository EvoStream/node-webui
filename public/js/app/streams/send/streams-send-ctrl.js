webuiApp.controller('streamsSendCtrl', ['$scope', '$http', '$timeout', 'listPullStreamFactory', '$uibModal', function ($scope, $http, $timeout, listPullStreamFactory, $uibModal) {

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

    //Get the List of Inbound Streams
    $scope.inboundList = [];
    listPullStreamFactory.updateListStreams().then(function (data) {

        //build the ui select list
        $scope.inboundList = data;
        $scope.inboundList.selected = $scope.inboundList[0];

        if($scope.inboundList.length < 1){
            $scope.streamsNotAvailable = true;
        }

    });


    $scope.changeProtocol = function () {

        if ($scope.pushStream.protocol == 'rtmp') {
            $scope.pushStream.targetPort = 1935;
        } else if ($scope.pushStream.protocol == 'rtsp') {
            $scope.pushStream.targetPort = 554;
        } else if ($scope.pushStream.protocol == 'mpegtstcp') {
            $scope.pushStream.targetPort = 5555;
        } else if ($scope.pushStream.protocol == 'mpegtsudp') {
            $scope.pushStream.targetPort = 5555;
        }

    };

    $scope.setDefaultValuesSendStreamForm = function () {

        $scope.pushStream = {
            protocol: 'rtmp',
            targetPort: '',
            targetAddress: ''
        };
    };



    $scope.sendStream = function () {

        if ($scope.inboundList.selected == null) {
            $scope.sendStreamLoading = false;
            $scope.invalidArgumentModal();
        } else {

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

            $scope.pushStream.uri = uri;

            var parameters = {
                uri: uri,
                localStreamName: $scope.inboundList.selected.name,
                targetStreamName: $scope.pushStream.targetStreamName
            };

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

                if (response.data.data != null || response.data.status == 'SUCCESS') {
                    $scope.seeAddedSendStream = true;
                    $scope.setDefaultValuesSendStreamForm();
                } else {
                    $scope.invalidArgumentModal();
                }

                $scope.sendStreamLoading = false;

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
        }, function () {
            $scope.sendStreamLoading = false;
        });
    };

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


