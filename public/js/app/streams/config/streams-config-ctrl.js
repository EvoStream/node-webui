webuiApp.controller('streamsConfigCtrl', ['$uibModal', '$scope', '$http', '$timeout', '$window', '$base64', '$location', '$routeParams', function ($uibModal, $scope, $http, $timeout, $window, $base64, $location, $routeParams) {

    //Select the Tab
    $scope.activeTab = '/config';

    $scope.configType = ['dash', 'hds', 'hls', 'metalistener', 'mss', 'process', 'pull', 'push', 'record', 'webrtc'];
    $scope.bsConfigTableControlPageSize = 0;
    $scope.bsConfigTableControlPageNumber = 0;
    $scope.configType.selected = 'pull';

    /*
     * build the listconfig table
     */

    //Set Action Column
    var actionColumn = {
        field: 'operate',
        title: 'Actions',
        align: 'center',
        width: '180',
        clickToSelect: false,
        formatter: configActionFormatter,
        events: {
            'click .info': function (e, value, row, index) {
                // var settingsInfo = configData[configTypeSelected][index];

                $scope.configInfoModal($scope.configType.selected, row);

            },
            'click .delete': function (e, value, row, index) {

                var rowHeaderConfig = row;

                $scope.configDeleteModal(rowHeaderConfig);

            }
        }
    };

    $scope.configData = {
        dash: {
            columnCollection: [
                {field: 'configId', sortable: true, title: 'Config ID'},
                {field: 'localStreamName', sortable: true, title: 'LocalStreamName'},
                {field: 'groupName', sortable: true, title: 'Group Name'}

            ]
        },
        hls: {
            columnCollection: [
                {field: 'configId', sortable: true, title: 'Config ID'},
                {field: 'localStreamName', sortable: true, title: 'LocalStreamName'},
                {field: 'groupName', sortable: true, title: 'Group Name'}

            ]
        },
        metalistener: {
            columnCollection: [
                {field: 'configId', sortable: true, title: 'Config ID'},
                {field: 'localStreamName', sortable: true, title: 'LocalStreamName'},
                {field: 'protocol', sortable: true, title: 'Protocol'},
                {field: 'port', sortable: true, title: 'Port'}

            ]
        },
        mss: {
            columnCollection: [
                {field: 'configId', sortable: true, title: 'Config ID'},
                {field: 'localStreamName', sortable: true, title: 'LocalStreamName'},
                {field: 'groupName', sortable: true, title: 'Group Name'}

            ]
        },
        hds: {
            columnCollection: [
                {field: 'configId', sortable: true, title: 'Config ID'},
                {field: 'localStreamName', sortable: true, title: 'LocalStreamName'},
                {field: 'groupName', sortable: true, title: 'Group Name'}

            ]
        },
        process: {
            columnCollection: [
                {field: 'configId', sortable: true, title: 'Config ID'},
                {field: 'fullBinaryPath', sortable: true, title: 'fullBinaryPath'},
                {field: 'groupName', sortable: true, title: 'Group Name'}
            ]
        },
        pull: {
            columnCollection: [
                {field: 'configId', sortable: true, title: 'Config ID'},
                {field: 'localStreamName', sortable: true, title: 'LocalStreamName'},
                {field: 'sourceURI', sortable: true, title: 'Source URI'}
            ]
        },
        pushEms: {
            columnCollection: [
                {field: 'configId', sortable: true, title: 'Config ID'},
                {field: 'localStreamName', sortable: true, title: 'LocalStreamName'},
                {field: 'targetUri', sortable: true, title: 'TargetUri'},
                {field: 'targetStreamName', sortable: true, title: 'TargetStreamName'}
            ]
        },
        record: {
            columnCollection: [
                {field: 'configId', sortable: true, title: 'Config ID'},
                {field: 'localStreamName', sortable: true, title: 'LocalStreamName'},
                {field: 'pathToFile', sortable: true, title: 'PathToFile'},
                {field: 'type', sortable: true, title: 'Type'}
            ]
        },
        webrtc: {
            columnCollection: [
                {field: 'configId', sortable: true, title: 'Config ID'},
                {field: 'ersip', sortable: true, title: 'ERS IP'},
                {field: 'ersport', sortable: true, title: 'ERS Port'},
                {field: 'roomid', sortable: true, title: 'Room ID'}


            ]
        }
    };

    //add the action column on each
    $scope.configData.dash.columnCollection.push(actionColumn);
    $scope.configData.hls.columnCollection.push(actionColumn);
    $scope.configData.metalistener.columnCollection.push(actionColumn);
    $scope.configData.mss.columnCollection.push(actionColumn);
    $scope.configData.hds.columnCollection.push(actionColumn);
    $scope.configData.process.columnCollection.push(actionColumn);
    $scope.configData.pull.columnCollection.push(actionColumn);
    $scope.configData.pushEms.columnCollection.push(actionColumn);
    $scope.configData.record.columnCollection.push(actionColumn);
    $scope.configData.webrtc.columnCollection.push(actionColumn);


    /*
     * build the socket.io connection
     */
    var streamsConfigCtrlSocket = io.connect($location.protocol() + '://' + $location.host() + ':' + $location.port());

    streamsConfigCtrlSocket.on('startListconfigMap', function (response) {

        $scope.configData.dash.rowCollection = response.dash.rowCollection;
        $scope.configData.hls.rowCollection = response.hls.rowCollection;
        $scope.configData.metalistener.rowCollection = response.metalistener.rowCollection;
        $scope.configData.mss.rowCollection = response.mss.rowCollection;
        $scope.configData.hds.rowCollection = response.hds.rowCollection;
        $scope.configData.process.rowCollection = response.process.rowCollection;
        $scope.configData.pull.rowCollection = response.pull.rowCollection;
        $scope.configData.pushEms.rowCollection = response.pushEms.rowCollection;
        $scope.configData.record.rowCollection = response.record.rowCollection;
        $scope.configData.webrtc.rowCollection = response.webrtc.rowCollection;

        listConfigs($scope.configType.selected);
        $scope.$apply();

    });


    streamsConfigCtrlSocket.on('updateListconfigMap', function (response) {

        //Get from socket.io
        $scope.configData.dash.rowCollection = response.dash.rowCollection;
        $scope.configData.hls.rowCollection = response.hls.rowCollection;
        $scope.configData.metalistener.rowCollection = response.metalistener.rowCollection;
        $scope.configData.mss.rowCollection = response.mss.rowCollection;
        $scope.configData.hds.rowCollection = response.hds.rowCollection;
        $scope.configData.process.rowCollection = response.process.rowCollection;
        $scope.configData.pull.rowCollection = response.pull.rowCollection;
        $scope.configData.pushEms.rowCollection = response.pushEms.rowCollection;
        $scope.configData.record.rowCollection = response.record.rowCollection;
        $scope.configData.webrtc.rowCollection = response.webrtc.rowCollection;

        listConfigs($scope.configType.selected);
        $scope.$apply();

    });


    //Load using routeParameters
    if ($routeParams.configTypeSelected != null) {
        listConfigs($routeParams.configTypeSelected);
    } else {
        var defaultConfigTypeSelected = 'pull';
        listConfigs(defaultConfigTypeSelected);
    }

    function listConfigs(configTypeSelected) {

        var pageSize = 5;
        var pageNumber = 1;

        if ($scope.bsConfigTableControl) {
            if (typeof $scope.bsConfigTableControl.state != 'undefined') {

                if (typeof $scope.bsConfigTableControl.state.pageSize !== 'undefined') {
                    pageSize = $scope.bsConfigTableControl.state.pageSize;
                    pageNumber = $scope.bsConfigTableControl.state.pageNumber;

                    $scope.bsConfigTableControlPageSize = pageSize;
                    $scope.bsConfigTableControlPageNumber = pageNumber;
                }

                if ($scope.bsConfigTableControlPageSize != 0) {
                    pageSize = $scope.bsConfigTableControlPageSize;
                    pageNumber = $scope.bsConfigTableControlPageNumber;
                }
            }
        } else {
            pageSize = 5;
            pageNumber = 1;
        }

        var bsTableData = null;

        if (configTypeSelected == 'dash') {
            bsTableData = $scope.configData.dash;
        } else if (configTypeSelected == 'hds') {
            bsTableData = $scope.configData.hds;
        } else if (configTypeSelected == 'hls') {
            bsTableData = $scope.configData.hls;
        } else if (configTypeSelected == 'metalistener') {
            bsTableData = $scope.configData.metalistener;
        }  else if (configTypeSelected == 'mss') {
            bsTableData = $scope.configData.mss;
        } else if (configTypeSelected == 'process') {
            bsTableData = $scope.configData.process;
        } else if (configTypeSelected == 'pull') {
            bsTableData = $scope.configData.pull;
        } else if (configTypeSelected == 'push') {
            bsTableData = $scope.configData.pushEms;
        } else if (configTypeSelected == 'record') {
            bsTableData = $scope.configData.record;
        } else if (configTypeSelected == 'webrtc') {
            bsTableData = $scope.configData.webrtc;
        }

        if (bsTableData !== undefined) {

            if (bsTableData) {
                $scope.noActiveStreams = false;

                //Build the Table
                $scope.bsConfigTableControl = {
                    options: {
                        data: bsTableData.rowCollection,
                        rowStyle: function (row, index) {
                            return {classes: 'none'};
                        },
                        cache: false,
                        height: 600,
                        striped: true,
                        pagination: true,
                        pageSize: pageSize,
                        pageNumber: pageNumber,
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
            }
        }

        $scope.configType.selected = configTypeSelected;

    }

    $scope.selectedConfigType = function () {
        listConfigs($scope.configType.selected);
    };


    function configActionFormatter(value, row, index) {

        var actionFormatterValue = [
            '<a class="info ml10" href="javascript:void(0)"  title="Details">',
            '<i class="glyphicon glyphicon-info-sign"></i>',
            '</a>',
            '<a class="delete ml10" href="javascript:void(0)"  title="Delete">',
            '<i class="glyphicon glyphicon-trash"></i>',
            '</a>',
        ].join('&nbsp;&nbsp;');

        return actionFormatterValue;
    }


    $scope.configInfoModal = function (configTypeSelected, rowHeaderConfig) {

        var configid = rowHeaderConfig.configId;

        $http.get("/ems/api/getconfiginfo?configid=" + configid).then(function (response) {

            var settingsInfo = response.data.data;

            var modalInstance = $uibModal.open({
                templateUrl: 'js/app/streams/config/modals/info-streams-config.html',
                controller: 'configInfoModalCtrl',
                size: 'lg',
                resolve: {
                    configTypeSelected: function () {

                        return configTypeSelected;
                    },
                    configRowHeaders: function () {

                        return rowHeaderConfig;
                    },
                    configRowBasic: function () {

                        var configRowBasic = settingsInfo;

                        return configRowBasic;
                    },
                    configRowCurrent: function () {

                        var configRowCurrent = [];

                        if(typeof settingsInfo.status !== 'undefined'){
                            configRowCurrent.header = 'Status: Current';
                            configRowCurrent.content = settingsInfo.status.current;
                        }

                        return configRowCurrent;
                    },
                    configRowPrevious: function () {

                        var configRowPrevious = [];

                        if(typeof settingsInfo.status !== 'undefined'){
                            configRowPrevious.header = 'Status: Previous';
                            configRowPrevious.content = settingsInfo.status.previous;
                        }
                        
                        return configRowPrevious;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $location.path('/config/' + $scope.configType.selected);
            }, function () {

            });

        });

    };

    $scope.configDeleteModal = function (rowHeaderConfig) {

        var modalInstance = $uibModal.open({
            templateUrl: 'js/app/streams/config/modals/delete-streams-config.html',
            controller: 'configConfirmDeleteModalCtrl',
            resolve: {
                configId: function () {

                    var configId = rowHeaderConfig.configId;

                    return configId;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.selectedConfigType();
        }, function () {
        });
    };


}]);


webuiApp.controller('configInfoModalCtrl', ['$scope', '$uibModal', '$uibModalInstance', '$window', '$base64', 'configTypeSelected', 'configRowHeaders', 'configRowBasic', 'configRowCurrent', 'configRowPrevious', function ($scope, $uibModal, $uibModalInstance, $window, $base64, configTypeSelected, configRowHeaders, configRowBasic, configRowCurrent, configRowPrevious) {

    $scope.configRowBasicNoArray = [];
    $scope.configRowBasicNoArray.content = {};

    for (var i in configRowBasic) {
        if (configRowBasic.status == configRowBasic[i]) {
            continue;
        } else {
            $scope.configRowBasicNoArray['content'][i] = configRowBasic[i];
        }
    }

    $scope.configRowHeaders = configRowHeaders;
    $scope.configRowCurrent = configRowCurrent;
    $scope.configRowPrevious = configRowPrevious;


    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };


    //Only show Play button on Inbound and HTTP Streams
    var configTypetoPlay = ["pull", "hls", "dash"];

    var playStream = configTypetoPlay.indexOf(configTypeSelected);

    $scope.showPlay = false;

    if (playStream != -1) {

        $scope.showPlay = true;

        $scope.playConfig = function ($event) {

            var infoRaw = configRowHeaders;
            infoRaw.streamFormat = configTypeSelected.toUpperCase();

            if (configTypeSelected.toUpperCase() == 'DASH' || configTypeSelected.toUpperCase() == 'HLS') {
                infoRaw.groupName = configRowBasic.groupName
            }

            var info = $base64.encode(JSON.stringify(infoRaw));

            $event.preventDefault();
            $window.open("/streams/play?info=" + info, 'windowOpenTab' + info, 'scrollbars=0,resizable=0,width=800,height=630,left=0,top=0');
        };
    }

    $scope.delete = function () {

        var modalInstance = $uibModal.open({
            templateUrl: 'js/app/streams/config/modals/delete-streams-config.html',
            controller: 'configConfirmDeleteModalCtrl',
            resolve: {
                configId: function () {

                    var configId = $scope.configRowHeaders.configId;
                    return configId;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $uibModalInstance.close();
        }, function () {
        });
    };

}]);


webuiApp.controller('configConfirmDeleteModalCtrl', ['$scope', '$uibModalInstance', '$http', 'configId', function ($scope, $uibModalInstance, $http, configId) {

    $scope.deleteConfigId = configId;

    $scope.delete = function () {

        $http.get("/ems/api/removeconfig?configid=" + configId).then(function (response) {

            $uibModalInstance.close();

        });
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

}]);