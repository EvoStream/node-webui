// webuiApp.controller('streamsActiveCtrl', ['$scope', '$http', '$timeout', 'listStreamFactory', function ($scope, $http, listStreamFactory) {
// webuiApp.controller('streamsActiveCtrl', ['$scope', '$http', '$timeout', function ($scope, $http) {
webuiApp.controller('streamsActiveCtrl', ['$uibModal', '$scope', '$http', '$timeout', '$window', '$base64', '$route', '$routeParams', function ($uibModal, $scope, $http, $timeout, $window, $base64, $route, $routeParams) {

    console.log('streamsActiveCtrl loaded');

    //Select the Tab
    $scope.activeTab = '/active';

    //Select the Inbound Stream Table
    $scope.streamTypeSelected = 'inbound';

    var vm = this;

    vm.disabled = false;
    vm.searchEnabled = true;

    console.log('starting $scope.streamTypeSelected ' + $scope.streamTypeSelected);
    console.log('starting $routeParams ' + JSON.stringify($routeParams));


    /*
     * Dropdown
     */

    $scope.streamTypeList = [
        {
            value: "inbound",
            text: "Inbound Live Stream (pull)",
            description: "“inbound” will refer to any stream coming into the EMS"
        },
        {
            value: "outbound",
            text: "Outbound Streams (push)",
            description: "“outbound” will refer to any stream leaving the EMS"
        },
        {
            value: "http",
            text: "Adaptive HTTP Streams",
            description: "existing HTTP streaming technologies, such as HLS, DASH, MSS, HDS"
        },
        {
            value: "file",
            text: "File Media",
            description: "Video on Demand Streaming"
        }
    ];

    $scope.streamType = {
        "list": $scope.streamTypeList,
        "default": {
            selected: {
                value: "inbound",
                text: "Inbound Live Stream (pull)",
                description: "“inbound” will refer to any stream coming into the EMS"
            }
        },
    };

    //Load using routeParameters
    if ($routeParams.streamTypeSelected != null) {

        if ($routeParams.streamTypeSelected == 'inbound') {
            $scope.streamTypeSelected = $routeParams.streamTypeSelected;
            $scope.streamType.default = {
                selected: $scope.streamTypeList[0]
            };
        } else if ($routeParams.streamTypeSelected == 'outbound') {
            $scope.streamTypeSelected = $routeParams.streamTypeSelected;
            $scope.streamType.default = {
                selected: $scope.streamTypeList[1]
            };
        } else if ($routeParams.streamTypeSelected == 'http') {
            $scope.streamTypeSelected = $routeParams.streamTypeSelected;
            $scope.streamType.default = {
                selected: $scope.streamTypeList[2]
            };
        } else if ($routeParams.streamTypeSelected == 'file') {
            $scope.streamTypeSelected = $routeParams.streamTypeSelected;
            $scope.streamType.default = {
                selected: $scope.streamTypeList[3]
            };
        }

        listStreams($routeParams.streamTypeSelected);


    } else {
        //Load Default Inbound Stream Table
        listStreams($scope.streamTypeSelected);
    }

    $scope.selectedStreamType = function () {
        // console.log('$scope.streamType.default.selected ' + JSON.stringify($scope.streamType.default.selected));
        // console.log('$scope.streamType.default.selected.value ' + $scope.streamType.default.selected.value);
        $scope.streamTypeSelected = $scope.streamType.default.selected.value;
        listStreams($scope.streamType.default.selected.value);

    };


    /*
     * List the Stream and Build Table
     */

    function listStreams(streamTypeSelected) {

        console.log('listStreams calls streamTypeSelected ' + streamTypeSelected);

        $http.get("/ems/api/liststreams").then(function (response) {

            vm.listStreams = response.data;

            // console.log('vm.listStreams ' + JSON.stringify(vm.listStreams));

            /*
             * Build the Data of the Table
             */

            $scope.noActiveStreams = false;

            //check type on list streams
            if (vm.listStreams.data != null) {

                $scope.listStreamsData = vm.listStreams.data;
                // $scope.listStreamsDataTemp = vm.listStreams.data;

                // var listStreamsDataTemp = vm.listStreams.data;

                //Initialize the stream information for the table
                $scope.streamData = {
                    inbound: {
                        columnCollection: [
                            {field: 'streamId', sortable: true, title: 'Stream ID'},
                            {field: 'streamFormat', sortable: true, title: 'Stream Format'},
                            {field: 'localStreamName', sortable: true, title: 'LocalStreamName'},
                            {field: 'sourceURI', sortable: true, title: 'Source URI'},
                            {field: 'audioCodec', sortable: true, title: 'Audio Codec'},
                            {field: 'videoCodec', sortable: true, title: 'Video Codec'},
                            {
                                field: 'operate',
                                title: 'Actions',
                                align: 'center',
                                width: '180',
                                clickToSelect: false,
                                formatter: actionFormatter,
                                events: {
                                    'click .info': function (e, value, row, index) {
                                        // console.log('INFO');
                                        // console.log('INFO row '+JSON.stringify(row));

                                        // $scope.infoModal(row, index, vm.listStreams.data, $scope.streamData.inbound);
                                        $scope.infoModal(row, vm.listStreams.data);

                                    },
                                    'click .delete': function (e, value, row, index) {
                                        console.log('DELETE');
                                        // // console.log('e ' + JSON.stringify(e));
                                        // console.log('value ' + JSON.stringify(value));
                                        // console.log('row ' + JSON.stringify(row));
                                        // console.log('index ' + JSON.stringify(index));

                                        $scope.deleteModal(row, index, vm.listStreams.data, $scope.streamData.inbound);


                                    },
                                    'click .play': function (e, value, row, index) {
                                        console.log('PLAY');
                                        $scope.playNewWindow(row);
                                    }
                                }
                            }
                        ]
                    },
                    outbound: {
                        columnCollection: [
                            {field: 'streamId', sortable: true, title: 'Stream ID'},
                            {field: 'streamFormat', sortable: true, title: 'Stream Format'},
                            {field: 'sourceStreamName', sortable: true, title: 'Source Stream Name'},
                            {field: 'farIp', sortable: true, title: 'Destination IP'},
                            {field: 'audioCodec', sortable: true, title: 'Audio Codec'},
                            {field: 'videoCodec', sortable: true, title: 'Video Codec'},
                            {
                                field: 'operate',
                                title: 'Actions',
                                align: 'center',
                                width: '180',
                                clickToSelect: false,
                                formatter: actionFormatter,
                                events: {
                                    'click .info': function (e, value, row, index) {
                                        console.log('INFO');
                                        $scope.infoModal(row, vm.listStreams.data);

                                    },
                                    'click .delete': function (e, value, row, index) {
                                        console.log('DELETE');
                                        // console.log('e ' + JSON.stringify());
                                        // console.log('value ' + JSON.stringify());
                                        // console.log('row ' + JSON.stringify());
                                        // console.log('index ' + JSON.stringify());

                                        // $scope.deleteModal(row, vm.listStreams.data);


                                    }
                                }
                            }
                        ]
                    },
                    http: {
                        columnCollection: [
                            {field: 'streamId', sortable: true, title: 'Stream ID'},
                            {field: 'streamFormat', sortable: true, title: 'Stream Format'},
                            {field: 'sourceStreamName', sortable: true, title: 'Source Stream Name'},
                            {field: 'groupName', sortable: true, title: 'Group Name'},
                            {field: 'audioCodec', sortable: true, title: 'Audio Codec'},
                            {field: 'videoCodec', sortable: true, title: 'Video Codec'},
                            {
                                field: 'operate',
                                title: 'Actions',
                                align: 'center',
                                width: '180',
                                clickToSelect: false,
                                formatter: actionFormatter,
                                events: {
                                    'click .info': function (e, value, row, index) {
                                        console.log('INFO');
                                        $scope.infoModal(row, vm.listStreams.data);

                                    },
                                    'click .delete': function (e, value, row, index) {
                                        console.log('DELETE');
                                        // console.log('e ' + JSON.stringify());
                                        // console.log('value ' + JSON.stringify());
                                        // console.log('row ' + JSON.stringify());
                                        // console.log('index ' + JSON.stringify());

                                        $scope.deleteModal(row, index, vm.listStreams.data, $scope.streamData.inbound.rowCollection);


                                    },
                                    'click .play': function (e, value, row, index) {
                                        console.log('PLAY');

                                        $scope.playNewWindow(row);
                                    }
                                }
                            }
                        ]
                    },
                    file: {
                        columnCollection: [
                            {field: 'streamId', sortable: true, title: 'Stream ID'},
                            {field: 'streamFormat', sortable: true, title: 'Stream Format'},
                            {field: 'localStreamName', sortable: true, title: 'LocalStreamName'},
                            {field: 'sourceURI', sortable: true, title: 'Source URI'},
                            {field: 'audioCodec', sortable: true, title: 'Audio Codec'},
                            {field: 'videoCodec', sortable: true, title: 'Video Codec'},
                            {
                                field: 'operate',
                                title: 'Actions',
                                align: 'center',
                                width: '180',
                                clickToSelect: false,
                                formatter: actionFormatter,
                                events: {
                                    'click .info': function (e, value, row, index) {
                                        // console.log('INFO');
                                        // console.log('INFO row '+JSON.stringify(row));

                                        // $scope.infoModal(row, index, vm.listStreams.data, $scope.streamData.inbound);
                                        $scope.infoModal(row, vm.listStreams.data);

                                    },
                                    'click .play': function (e, value, row, index) {
                                        console.log('PLAY');
                                        $scope.playNewWindow(row);
                                    }
                                }
                            }
                        ]
                    },
                };

                $scope.streamData.inbound.rowCollection = [];
                $scope.streamData.outbound.rowCollection = [];
                $scope.streamData.http.rowCollection = [];
                $scope.streamData.file.rowCollection = [];

                for (var i in $scope.listStreamsData) {
                    // console.log('dataStream[i] ' + JSON.stringify(dataStream[i]));
                    // console.log('vm.listStreams[i].type '+vm.listStreams[i].type);

                    // console.log('dataStream[i].type.charAt(0) '+dataStream[i].type.charAt(0));

                    if ($scope.listStreamsData[i].type.charAt(0) == 'I') {

                        var sourceURI = '';
                        var streamFormat = "Inbound";

                        // console.log('$scope.listStreamsData[i].type  ' + $scope.listStreamsData[i].type);

                        if ($scope.listStreamsData[i].hasOwnProperty('pullSettings')) {
                            sourceURI = $scope.listStreamsData[i].pullSettings.uri;
                            streamFormat = 'PULL';

                            //set the type as inbound
                            $scope.streamData.inbound.rowCollection.push({
                                "streamId": $scope.listStreamsData[i].uniqueId,
                                "streamFormat": streamFormat,
                                "localStreamName": $scope.listStreamsData[i].name,
                                "sourceURI": sourceURI,
                                "audioCodec": $scope.listStreamsData[i].audio.codec,
                                "videoCodec": $scope.listStreamsData[i].video.codec
                            });

                        } else if ($scope.listStreamsData[i].type = 'IFR') {
                            streamFormat = 'VOD';
                            $scope.listStreamsData[i].name = $scope.listStreamsData[i].name.split('\\').pop().split('/').pop();

                            //set the type as inbound
                            $scope.streamData.file.rowCollection.push({
                                "streamId": $scope.listStreamsData[i].uniqueId,
                                "streamFormat": streamFormat,
                                "localStreamName": $scope.listStreamsData[i].name,
                                "sourceURI": sourceURI,
                                "audioCodec": $scope.listStreamsData[i].audio.codec,
                                "videoCodec": $scope.listStreamsData[i].video.codec
                            });
                        }


                    } else if ($scope.listStreamsData[i].type.charAt(0) == 'O') {

                        var streamFormat = "Outbound";
                        var groupName = '';

                        if ($scope.listStreamsData[i].hasOwnProperty('hlsSettings')) {
                            streamFormat = 'HLS';
                            groupName = $scope.listStreamsData[i].hlsSettings.groupName;

                        } else if ($scope.listStreamsData[i].hasOwnProperty('dashSettings')) {
                            streamFormat = 'DASH';
                            groupName = $scope.listStreamsData[i].dashSettings.groupName;

                        } else if ($scope.listStreamsData[i].hasOwnProperty('hdsSettings')) {
                            streamFormat = 'HDS';
                            groupName = $scope.listStreamsData[i].hdsSettings.groupName;

                        } else if ($scope.listStreamsData[i].hasOwnProperty('mssSettings')) {
                            streamFormat = 'MSS';
                            groupName = $scope.listStreamsData[i].mssSettings.groupName;

                        } else {
                            if ($scope.listStreamsData[i].hasOwnProperty('pushSettings')) {
                                streamFormat = 'PUSH';
                            }
                            else if ($scope.listStreamsData[i].type = 'ONR') {
                                streamFormat = 'VOD';
                            }
                        }

                        // console.log('streamFormat '+streamFormat);

                        if (streamFormat == 'Outbound' || streamFormat == 'PUSH') {

                            // console.log('streamFormat Outbound');

                            $scope.streamData.outbound.rowCollection.push({
                                "streamId": $scope.listStreamsData[i].uniqueId,
                                "streamFormat": streamFormat,
                                "sourceStreamName": $scope.listStreamsData[i].name,
                                "farIp": $scope.listStreamsData[i].farIp,
                                "audioCodec": $scope.listStreamsData[i].audio.codec,
                                "videoCodec": $scope.listStreamsData[i].video.codec
                            });

                            // console.log('$scope.streamData.outbound.rowCollection ' + JSON.stringify($scope.streamData.outbound.rowCollection));

                        } else {

                            $scope.streamData.http.rowCollection.push({
                                "streamId": $scope.listStreamsData[i].uniqueId,
                                "streamFormat": streamFormat,
                                "sourceStreamName": $scope.listStreamsData[i].name,
                                "groupName": groupName,
                                "audioCodec": $scope.listStreamsData[i].audio.codec,
                                "videoCodec": $scope.listStreamsData[i].video.codec
                            });

                            // console.log('$scope.streamData.http.rowCollection ' + JSON.stringify($scope.streamData.http.rowCollection));
                        }
                    }
                }


                // console.log('$scope.streamData ' + JSON.stringify($scope.streamData));
                var bsTableData = null;

                // console.log('streamTypeSelected '+streamTypeSelected);

                if (streamTypeSelected == 'inbound') {
                    bsTableData = $scope.streamData.inbound;
                } else if (streamTypeSelected == 'outbound') {
                    bsTableData = $scope.streamData.outbound;
                } else if (streamTypeSelected == 'http') {
                    bsTableData = $scope.streamData.http;
                } else if (streamTypeSelected == 'file') {
                    bsTableData = $scope.streamData.file;
                }


                // console.log('bsTableData ' + JSON.stringify(bsTableData));

                //Set to bsTable
                $scope.bsTableControl = {
                    options: {
                        data: bsTableData.rowCollection,
                        rowStyle: function (row, index) {
                            return {classes: 'none'};
                        },
                        cache: false,
                        height: 600,
                        striped: true,
                        pagination: true,
                        pageSize: 7,
                        pageList: [5, 10, 25, 50, 100, 200],
                        search: true,
                        showColumns: false,
                        showRefresh: false,
                        minimumCountColumns: 2,
                        clickToSelect: false,
                        showToggle: false,
                        maintainSelected: true,
                        dataSortOrder: "desc",
                        columns: bsTableData.columnCollection
                    }
                };
            } else {
                //show that there are no streams active
                $scope.noActiveStreams = true;
            }
        });

        // //Check ListStream Update
        // $timeout(function () {
        //     console.log("$timeout triggered listStreams $scope.streamTypeSelected "+$scope.streamTypeSelected);
        //     listStreams($scope.streamTypeSelected);
        // }, 3000);
    }

    function actionFormatter(value, row, index) {

        console.log('actionFormatter row ' + JSON.stringify(row));

        var actionFormatterValue = [
            '<a class="info ml10" href="javascript:void(0)"  title="Details">',
            '<i class="glyphicon glyphicon-info-sign"></i>',
            '</a>',
            '<a class="play ml10"  href="javascript:void(0)"  title="Play">',
            '<i class="glyphicon glyphicon-play"></i>',
            '</a>',
            '<a class="delete ml10" href="javascript:void(0)"  title="Delete">',
            '<i class="glyphicon glyphicon-trash"></i>',
            '</a>',
        ].join('&nbsp;&nbsp;');

        if ($scope.streamTypeSelected == 'outbound') {
            actionFormatterValue = [
                '<a class="info ml10" href="javascript:void(0)"  title="Details">',
                '<i class="glyphicon glyphicon-info-sign"></i>',
                '</a>',
                '<a class="delete ml10" href="javascript:void(0)"  title="Delete">',
                '<i class="glyphicon glyphicon-trash"></i>',
                '</a>',
            ].join('&nbsp;&nbsp;');
        }

        if ($scope.streamTypeSelected == 'file') {
            actionFormatterValue = [
                '<a class="info ml10" href="javascript:void(0)"  title="Details">',
                '<i class="glyphicon glyphicon-info-sign"></i>',
                '</a>',
                '<a class="play ml10"  href="javascript:void(0)"  title="Play">',
                '<i class="glyphicon glyphicon-play"></i>',
                '</a>',
            ].join('&nbsp;&nbsp;');
        }

        return actionFormatterValue;
    }

    $scope.infoModal = function (row, listStreamsDataTemp) {

        // console.log('inboundInfo $scope.streamType.default.selected.value ' + $scope.streamType.default.selected.value);
        // console.log('inboundInfo $scope.streamTypeSelected ' + $scope.streamTypeSelected);


        console.log('inboundInfo listStreamsDataTemp ' + JSON.stringify(listStreamsDataTemp));

        var index = 0;
        for (var i in listStreamsDataTemp) {
            if (listStreamsDataTemp[i].uniqueId === row.streamId) {
                index = i;
            }
        }
        // index++;

        // var index = listStreamsDataTemp.findIndex(function (item, i) {
        //     return listStreamsDataTemp.uniqueId === row.streamId;
        // });

        console.log('index ' + index);
        console.log('inboundInfo listStreamsDataTemp index ' + JSON.stringify(listStreamsDataTemp[index]));
        console.log('inboundInfo row ' + JSON.stringify(row));

        var listStreamsData = listStreamsDataTemp[index];

        var streamType = $scope.streamType.default.selected.value;

        var modalInstance = $uibModal.open({
            templateUrl: 'js/app/streams/active/modals/info-streams-active.html',
            controller: 'activeInfoModalCtrl',
            size: 'lg',
            resolve: {
                streamRowHeaders: function () {

                    var streamRowHeaders = {};

                    if (streamType != 'file') {
                        for (var i in row) {
                            if ((row.audioCodec == row[i]) || (row.videoCodec == row[i])) {
                                continue;
                            } else {
                                streamRowHeaders[i] = row[i];
                            }
                        }
                    }


                    return streamRowHeaders;
                },
                streamRow: function () {

                    var streamRowTemp = listStreamsData;

                    return streamRowTemp;
                },
                streamRowAudio: function () {

                    var streamRowAudio = [];

                    streamRowAudio.header = 'Audio';
                    streamRowAudio.content = listStreamsData.audio;

                    return streamRowAudio;
                },
                streamRowVideo: function () {

                    var streamRowVideo = [];
                    streamRowVideo.header = 'Video';
                    streamRowVideo.content = listStreamsData.video;

                    return streamRowVideo;

                },
                streamRowSettings: function () {

                    var streamRowTemp = listStreamsData;
                    var streamRowSettings = [];
                    streamRowSettings.content = [];

                    if (streamRowTemp.hasOwnProperty('pullSettings')) {
                        streamRowSettings.header = 'pullSettings';
                    } else if (streamRowTemp.hasOwnProperty('pushSettings')) {
                        streamRowSettings.header = 'pushSettings';
                    } else if (streamRowTemp.hasOwnProperty('hlsSettings')) {
                        streamRowSettings.header = 'hlsSettings';
                    } else if (streamRowTemp.hasOwnProperty('hdsSettings')) {
                        streamRowSettings.header = 'hdsSettings';
                    } else if (streamRowTemp.hasOwnProperty('dashSettings')) {
                        streamRowSettings.header = 'dashSettings';
                    } else if (streamRowTemp.hasOwnProperty('mssSettings')) {
                        streamRowSettings.header = 'mssSettings';
                    }

                    streamRowSettings.content = streamRowTemp[streamRowSettings.header];

                    for (var i in streamRowSettings.content) {
                        if (i.charAt(0) == '_') {
                            streamRowSettings.content[i] = null;
                            delete streamRowSettings.content[i];
                        }
                    }

                    return streamRowSettings;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            // $ctrl.selected = selectedItem;
            console.log('$scope.infoModal modalInstance.result ');
            
            $route.reload();

        }, function () {

        });
    };

    $scope.deleteModal = function (row, rowCollectionIndex, listStreamsDataTemp, streamData) {

        // console.log('inboundDelete $scope.streamTypeSelected ' + $scope.streamTypeSelected);

        var index = 0;
        for (var i in listStreamsDataTemp) {
            if (listStreamsDataTemp[i].uniqueId === row.streamId) {
                index = i;
            }
        }

        console.log('streamData.rowCollection[rowCollectionIndex] ' + JSON.stringify(streamData.rowCollection[rowCollectionIndex]));

        console.log('inboundInfo listStreamsDataTemp index ' + JSON.stringify(listStreamsDataTemp[index]));

        var listStreamsData = listStreamsDataTemp[index];

        var modalInstance = $uibModal.open({
            templateUrl: 'js/app/streams/active/modals/delete-streams-active.html',
            controller: 'activeConfirmDeleteModalCtrl',
            resolve: {
                configId: function () {

                    var streamRowTemp = listStreamsData;
                    var configId = null;

                    if (streamRowTemp.hasOwnProperty('pullSettings')) {
                        configId = streamRowTemp.pullSettings.configId;
                    } else if (streamRowTemp.hasOwnProperty('pushSettings')) {
                        configId = streamRowTemp.pushSettings.configId;
                    } else if (streamRowTemp.hasOwnProperty('hlsSettings')) {
                        configId = streamRowTemp.hlsSettings.configId;
                    } else if (streamRowTemp.hasOwnProperty('hdsSettings')) {
                        configId = streamRowTemp.hdsSettings.configId;
                    } else if (streamRowTemp.hasOwnProperty('dashSettings')) {
                        configId = streamRowTemp.dashSettings.configId;
                    } else if (streamRowTemp.hasOwnProperty('mssSettings')) {
                        configId = streamRowTemp.mssSettings.configId;
                    }

                    console.log('configId ' + configId);

                    $scope.deleteConfigId = configId;

                    console.log('01 $scope.deleteConfigId ' + $scope.deleteConfigId);

                    return configId;
                }
            }
        });

        modalInstance.result.then(function (result) {
            console.log('deleteModal modalInstance.result ');
            $scope.selectedStreamType();
        }, function () {
            console.log('01 deleteModal modalInstance Modal dismissed at: ' + new Date());

        });
    };


    $scope.playNewWindow = function (row) {
        var info = $base64.encode(JSON.stringify(row));

        console.log('row ' + JSON.stringify(row));

        $window.open("/streams/play?info=" + info, 'windowOpenTab' + info, 'scrollbars=0,resizable=0,width=800,height=630,left=0,top=0');
    };


}]);


webuiApp.controller('activeConfirmDeleteModalCtrl', ['$scope', '$uibModalInstance', '$http', 'configId', function ($scope, $uibModalInstance, $http, configId) {

    // $scope.localStreamName = items;
    console.log('active confirmDeleteModalCtrl confirmDeleteModalCtrl ');

    $scope.deleteConfigId = configId;

    console.log('02 $scope.deleteConfigId ' + $scope.deleteConfigId);

    $scope.delete = function () {
        console.log('Active: confirmDeleteModalCtrl ok');
        // $uibModalInstance.dismiss('cancel');

        $http.get("/ems/api/removeconfig?configid=" + configId).then(function (response) {

            console.log('response ' + JSON.stringify(response));

            $uibModalInstance.close();
            // $uibModalInstance.close({$value: filepath});

        });
    };

    $scope.cancel = function () {
        console.log('Active: confirmDeleteModalCtrl cancel');
        $uibModalInstance.dismiss('cancel');
    };

}]);


webuiApp.controller('activeInfoModalCtrl', ['$scope', '$uibModal', '$uibModalInstance', '$window', 'streamRowHeaders', 'streamRow', 'streamRowAudio', 'streamRowVideo', 'streamRowSettings', function ($scope, $uibModal, $uibModalInstance, $window, streamRowHeaders, streamRow, streamRowAudio, streamRowVideo, streamRowSettings) {

    console.log('streamRow ' + JSON.stringify(streamRow));

    $scope.streamRowNoArray = [];
    $scope.streamRowNoArray.content = {};

    for (var i in streamRow) {
        if ((streamRow.audio == streamRow[i]) || (streamRow.video == streamRow[i]) || (streamRow[streamRowSettings.header] == streamRow[i])) {
            continue;
        } else {
            $scope.streamRowNoArray['content'][i] = streamRow[i];
        }
    }

    $scope.streamRowHeaders = streamRowHeaders;
    $scope.streamRowAudio = streamRowAudio;
    $scope.streamRowVideo = streamRowVideo;
    $scope.streamRowSettings = streamRowSettings;
    console.log('streamRowSettings.content ' + JSON.stringify(streamRowSettings.content));
    console.log('streamRowHeaders ' + JSON.stringify(streamRowHeaders));

    $scope.cancel = function () {
        console.log('infoModalCtrl cancel');
        $uibModalInstance.dismiss('cancel');
    };

    $scope.play = function () {
        console.log('infoModalCtrl play');
        // $uibModalInstance.dismiss('cancel');
        $window.open("/streams/play", 'windowOpenTab', '_blank,scrollbars=0,resizable=0,width=500,height=300,left=0,top=0');
    };

    $scope.delete = function () {
        console.log('infoModalCtrl delete');
        console.log('inboundDelete $scope.streamTypeSelected ' + $scope.streamTypeSelected);

        var modalInstance = $uibModal.open({
            templateUrl: 'js/app/streams/active/modals/delete-streams-active.html',
            controller: 'activeConfirmDeleteModalCtrl',
            resolve: {
                configId: function () {

                    var streamRowTemp = streamRow;
                    var configId = null;

                    if (streamRowTemp.hasOwnProperty('pullSettings')) {
                        configId = streamRowTemp.pullSettings.configId;
                    } else if (streamRowTemp.hasOwnProperty('pushSettings')) {
                        configId = streamRowTemp.pushSettings.configId;
                    } else if (streamRowTemp.hasOwnProperty('hlsSettings')) {
                        configId = streamRowTemp.hlsSettings.configId;
                    } else if (streamRowTemp.hasOwnProperty('hdsSettings')) {
                        configId = streamRowTemp.hdsSettings.configId;
                    } else if (streamRowTemp.hasOwnProperty('dashSettings')) {
                        configId = streamRowTemp.dashSettings.configId;
                    } else if (streamRowTemp.hasOwnProperty('mssSettings')) {
                        configId = streamRowTemp.mssSettings.configId;
                    }

                    console.log('configId ' + configId);


                    return configId;
                }
            }
        });

        modalInstance.result.then(function (result) {
            console.log('deleteModal modalInstance.result ');
            $uibModalInstance.close();
            // $uibModalInstance.dismiss('cancel');
        }, function () {

        });

    };

}]);