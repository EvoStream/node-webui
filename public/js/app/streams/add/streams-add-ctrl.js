webuiApp.controller('streamsAddCtrl', ['$scope', '$http', '$timeout', 'listPullStreamFactory', '$uibModal', function ($scope, $http, $timeout, listPullStreamFactory, $uibModal) {

    console.log('streamsAddCtrl loaded');
    
    //Default Values
    $scope.activeTab = '/add';

    $scope.seeAddedStream = false;

    //Regex Patterns
    $scope.onlyNumbers = /^\d+$/;

    $scope.addButtonText = 'Add Stream';

    //Dropdown List for Privacy Status
    $scope.addStreamType = [
        {
            value: "inbound",
            text: "Inbound Live Stream (pull)",
            description: "“inbound” will refer to any stream coming into the EMS"
        },
        {
            value: "hls",
            text: "HTTP Live Streaming (HLS)",
            description: "Create an HTTP Live Stream (HLS) out of an existing H.264/AAC stream"
        },
        {
            value: "dash",
            text: "Dynamic Adaptive Streaming over HTTP (DASH)",
            description: "Create Dynamic Adaptive Streaming over HTTP (DASH) out of an existing H.264/AAC stream"
        },
        {
            value: "mss",
            text: "Microsoft Smooth Streaming (MSS)",
            description: "Create a Microsoft Smooth Stream (MSS) out of an existing H.264/AAC stream"
        },
        {
            value: "hds",
            text: "HTTP Dynamic Streaming (HDS)",
            description: "Create an HDS (HTTP Dynamic Streaming) stream out of an existing H.264/AAC stream"
        }
    ];
    // Set default value for Privacy Status
    $scope.addStreamType.selected = $scope.addStreamType[0];

    /*
     * Default Values
     */
    $scope.inbound = {
        uri: '',
        localStreamName: ''
    };

    $scope.hls = {
        targetFolder: '/var/www',
        bandwidths: '',
        groupName: '',
        chunkLength: 10
    };

    $scope.hds = {
        targetFolder: '/var/www',
        bandwidths: '',
        groupName: '',
        chunkLength: 10
    };

    $scope.dash = {
        targetFolder: '/var/www',
        bandwidths: '',
        groupName: '',
        chunkLength: 10
    };

    $scope.mss = {
        targetFolder: '/var/www',
        bandwidths: '',
        groupName: '',
        chunkLength: 10
    };

    //Get the List of Inbound Streams
    $scope.inboundList = [];
    $scope.refreshInboundList;

    $scope.refreshInboundList = function () {

        $scope.seeAddedStream = false;

        listPullStreamFactory.updateListStreams().then(function (data) {

            //build the ui select list
            $scope.inboundList = data;

            if ($scope.inboundList.length < 1 && $scope.addStreamType.selected.value != 'inbound') {
                $scope.streamsNotAvailable = true;
            }

        });
    };

    $scope.setDefaultValuesAddStreamForm = function () {

        $scope.inbound.uri = '';
        $scope.inbound.localStreamName = '';

        $scope.inboundList.selected = [];

        $scope.hls.targetFolder = '';
        $scope.hls.bandwidths = '';
        $scope.hls.groupName = '';
        $scope.hls.chunkLength = 10;
        $scope.hds.targetFolder = '';
        $scope.hds.bandwidths = '';
        $scope.hds.groupName = '';
        $scope.hds.chunkLength = 10;
        $scope.dash.targetFolder = '';
        $scope.dash.bandwidths = '';
        $scope.dash.groupName = '';
        $scope.dash.chunkLength = 10;
        $scope.mss.targetFolder = '';
        $scope.mss.bandwidths = '';
        $scope.mss.groupName = '';
        $scope.mss.chunkLength = 10;
    };


    $scope.addStream = function () {

        $scope.addStreamLoading = true;
        $scope.addButtonText = 'Creating the Stream...';
        $scope.seeAddedStream = false;

        var streamType = $scope.addStreamType.selected.value;
        var parameters = null;
        var command = null;

        if (streamType != 'inbound') {
            if ($scope.inboundList.selected == null) {
                $scope.addStreamLoading = false;
                $scope.invalidArgumentModal();
            }

            if (streamType == 'hls') {
                command = 'createHLSStream';
                parameters = $scope.hls;
            } else if (streamType == 'hds') {
                command = 'createHDSStream';
                parameters = $scope.hds;
            } else if (streamType == 'dash') {
                command = 'createDASHStream';
                parameters = $scope.dash;
            } else if (streamType == 'mss') {
                command = 'createMSSStream';
                parameters = $scope.mss;
            }

            parameters.localStreamNames = '';

            if ($scope.inboundList.selected.length == 1) {

                var bandwidths = [];
                if (streamType == 'hls') {
                    bandwidths = $scope.hls.bandwidths.split(",");
                } else if (streamType == 'hds') {
                    bandwidths = $scope.hds.bandwidths.split(",");
                } else if (streamType == 'dash') {
                    bandwidths = $scope.dash.bandwidths.split(",");
                } else if (streamType == 'mss') {
                    bandwidths = $scope.mss.bandwidths.split(",");
                }

                if(bandwidths.length > 1){
                    var ctr = 1;
                    for (var b = 0; b < bandwidths.length; b++) {
                        parameters.localStreamNames += $scope.inboundList.selected[0].name;

                        if(ctr != bandwidths.length){
                            parameters.localStreamNames += ',';
                        }

                        ctr++;
                    }
                }else{
                    parameters.localStreamNames = $scope.inboundList.selected[0].name;
                }

            }else{
                var ctr = 1;
                for (var i in $scope.inboundList.selected) {

                    parameters.localStreamNames += $scope.inboundList.selected[i].name ;

                    if($scope.inboundList.selected.length != ctr){
                        parameters.localStreamNames += ',';
                    }

                    ctr++;

                }
            }

        } else {
            command = 'pullStream';
            parameters = $scope.inbound;
        }


        var data = $.param({
            command: command,
            parameters: $.param(parameters)
        });


        $http({
            method: 'POST',
            url: '/ems/api/execute-command',
            data: data,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function (response) {

            if (response.data.data != null || response.data.status != 'FAIL') {
                $scope.seeAddedStream = true;
                $scope.setDefaultValuesAddStreamForm();

                if ($scope.addStreamType.selected.value != 'inbound') {
                    $scope.seeAddedStreamType = '/streams#/active/http';
                }else{
                    $scope.seeAddedStreamType = '/streams#/active/inbound';
                }

            } else {
                $scope.forAddStreamErrorMessage = response.data.description;
                $scope.invalidArgumentModal();
            }

            $scope.addStreamLoading = false;
            $scope.addButtonText = 'Add Stream';

        });
    };

    $scope.invalidArgumentModal = function () {

        var modalInstance = $uibModal.open({
            templateUrl: 'js/app/streams/add/modals/invalid-params-streams-add.html',
            controller: 'invalidArgumentAddModalCtrl',
            resolve: {
                addStreamErrorMessage: function () {

                    var addStreamErrorMessage = $scope.forAddStreamErrorMessage;

                    return addStreamErrorMessage;
                },
                addStreamLoading: function () {
                    return $scope.addStreamLoading;
                }
            }
        });

        modalInstance.result.then(function () {
        }, function () {
            $scope.addStreamLoading = false;
        });
    };

}]);


webuiApp.controller('invalidArgumentAddModalCtrl', ['$scope', '$uibModalInstance', 'addStreamErrorMessage', function ($scope, $uibModalInstance, addStreamErrorMessage) {

    $scope.addStreamErrorMessage = addStreamErrorMessage;

    $scope.ok = function () {
        $scope.addStreamLoading = false;
        $uibModalInstance.dismiss('ok');
    };

    $scope.cancel = function () {
        $scope.addStreamLoading = false;
        $uibModalInstance.dismiss('cancel');
    };

}]);


