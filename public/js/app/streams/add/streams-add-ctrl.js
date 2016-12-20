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
        groupName: '',
        chunkLength: 10
    };

    $scope.hds = {
        targetFolder: '/var/www',
        groupName: '',
        chunkLength: 10
    };

    $scope.dash = {
        targetFolder: '/var/www',
        groupName: '',
        chunkLength: 10
    };

    $scope.mss = {
        targetFolder: '/var/www',
        groupName: '',
        chunkLength: 10
    };

    console.log('streamsSendCtrl $scope.pushStream ' + JSON.stringify($scope.pushStream));

    //Get the List of Inbound Streams
    $scope.inboundList = [];
    $scope.refreshInboundList;


    $scope.refreshInboundList = function () {
        listPullStreamFactory.updateListStreams().then(function (data) {
            //     .then(function(data){
            console.log('streamsSendCtrl output ' + JSON.stringify(data));

            //build the ui select list
            $scope.inboundList = data;
            // $scope.inboundList.selected = $scope.inboundList[0];

            console.log('$scope.inboundList ' + JSON.stringify($scope.inboundList));
            console.log('$scope.inboundList.length ' + $scope.inboundList.length);

            if ($scope.inboundList.length < 1 && $scope.addStreamType.selected.value != 'inbound') {
                $scope.streamsNotAvailable = true;
            }

        });
    };

    $scope.setDefaultValuesAddStreamForm = function () {

        console.log('$scope.setToDefaultValuesAddStreamForm $scope.setToDefaultValuesAddStreamForm ');

        $scope.inbound.uri = '';
        $scope.inbound.localStreamName = '';

        $scope.inboundList.selected = [];

        $scope.hls.targetFolder = '';
        $scope.hls.groupName = '';
        $scope.hls.chunkLength = 10;
        $scope.hds.targetFolder = '';
        $scope.hds.groupName = '';
        $scope.hds.chunkLength = 10;
        $scope.dash.targetFolder = '';
        $scope.dash.groupName = '';
        $scope.dash.chunkLength = 10;
        $scope.mss.targetFolder = '';
        $scope.mss.groupName = '';
        $scope.mss.chunkLength = 10;
    };


    $scope.addStream = function () {
        console.log('addStream addStream');

        // console.log('$scope.pushStream ' + JSON.stringify($scope.pushStream));
        console.log('$scope.addStreamType.selected ' + JSON.stringify($scope.addStreamType.selected));
        console.log('$scope.addStreamType.selected.value ' + $scope.addStreamType.selected.value);
        console.log('$scope.inboundList.selected ' + JSON.stringify($scope.inboundList.selected));

        $scope.addStreamLoading = true;
        $scope.addButtonText = 'Creating the Stream...';


        var streamType = $scope.addStreamType.selected.value;

        // console.log('$scope[streamType+TargetFolder] '+$scope[streamType+'TargetFolder'] );
        console.log('$scope.hls.targetFolder ' + $scope.hls.targetFolder);

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
                parameters.localStreamNames = $scope.inboundList.selected[0].name;
            }else{
                var ctr = 1;
                for (var i in $scope.inboundList.selected) {

                    parameters.localStreamNames += $scope.inboundList.selected[i].name ;

                    if($scope.inboundList.selected.length != ctr){
                        parameters.localStreamNames += ',';
                    }

                    ctr++;

                    console.log('$scope.inboundList.selected[i] ' + JSON.stringify($scope.inboundList.selected[i]));

                }
            }

            console.log('parameters.localStreamNames '+parameters.localStreamNames );

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

            console.log('response ' + JSON.stringify(response));
            console.log('(response.data.data != null) '+(response.data.data != null) );

            if (response.data.data != null || response.data.status != 'FAIL') {
                $scope.seeAddedStream = true;
                $scope.setDefaultValuesAddStreamForm();

                console.log('$scope.addStreamType.selected.value '+$scope.addStreamType.selected.value );

                if ($scope.addStreamType.selected.value != 'inbound') {
                    $scope.seeAddedStreamType = '/streams#/active/http';
                }else{
                    $scope.seeAddedStreamType = '/streams#/active/inbound';
                }


                console.log('$scope.seeAddedStreamType '+$scope.seeAddedStreamType );



            } else {
                $scope.invalidArgumentModal();
            }

            $scope.addStreamLoading = false;
            $scope.addButtonText = 'Add Stream';

        });


    };


    $scope.setToDefaultValuesAddStreamForm = function () {
        $scope.inbound.uri = '';
        $scope.inbound.localStreamName = '';

        $scope.inboundList.selected = $scope.inboundList[0];
        $scope.hls.targetFolder = '';
        $scope.hls.groupName = '';
        $scope.hds.targetFolder = '';
        $scope.hls.groupName = '';
    };


    $scope.invalidArgumentModal = function () {


        var modalInstance = $uibModal.open({
            templateUrl: 'js/app/streams/add/modals/invalid-params-streams-add.html',
            controller: 'invalidArgumentModalCtrl',
            resolve: {
                addStreamLoading: function () {
                    return $scope.addStreamLoading;
                }
            }
        });

        modalInstance.result.then(function () {
            // $ctrl.selected = selectedItem;
            // $scope.sendStreamLoading = false;
        }, function () {
            // $log.info('Modal dismissed at: ' + new Date());
            $scope.addStreamLoading = false;
        });
    };

}]);


webuiApp.controller('invalidArgumentModalCtrl', ['$scope', '$uibModalInstance', '$http', function ($scope, $uibModalInstance, $http) {

    $scope.ok = function () {
        console.log('invalidArgumentModalCtrl ok');
        $scope.addStreamLoading = false;
        $uibModalInstance.dismiss('ok');
    };

    $scope.cancel = function () {
        console.log('invalidArgumentModalCtrl cancel');
        $scope.addStreamLoading = false;
        $uibModalInstance.dismiss('cancel');
    };

}]);


