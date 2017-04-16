webuiApp.controller('streamsConfigCtrl', ['$uibModal', '$scope', '$http', '$timeout', '$window', '$base64', '$location', '$routeParams', function ($uibModal, $scope, $http, $timeout, $window, $base64, $location, $routeParams) {

    console.log('streamsConfigCtrl loaded');

    var streamsConfigCtrl = this;

    //Select the Tab
    $scope.activeTab = '/config';

    $scope.configType = [];

    //Load using routeParameters
    if ($routeParams.configTypeSelected != null) {
        listConfigs($routeParams.configTypeSelected);
    }else{
        var defaultConfigTypeSelected = 'pull';
        listConfigs(defaultConfigTypeSelected);
    }

    function listConfigs(configTypeSelected) {
        $http.get("/ems/api/get-list-config").then(function (response) {

            var configData = response.data.data;
            $scope.configType = [];

            if (configData != null) {

                //Set the Config Type Dropdown Filter
                for (var i in configData) {

                    console.log('i ' + i);

                    //Create the dropdown
                    $scope.configType.push(i);
                    $scope.configType.selected = configTypeSelected;

                    if (configTypeSelected == i) {

                        //Set the rows
                        var settingsData = configData[i];

                        if(settingsData.length > 0){

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
                                        var settingsInfo = configData[configTypeSelected][index];

                                        var rowHeaderConfig = $scope.rowConfigData[index];

                                        $scope.configInfoModal($scope.configType.selected, settingsInfo, rowHeaderConfig);

                                    },
                                    'click .delete': function (e, value, row, index) {

                                        var rowHeaderConfig = $scope.rowConfigData[index];

                                        $scope.configDeleteModal(rowHeaderConfig);

                                    }
                                }
                            };

                            //Set the columns first
                            if(configTypeSelected == 'dash'){
                                $scope.tableConfigData = {
                                    dash: {
                                        columnCollection: [
                                            {field: 'configId', sortable: true, title: 'Config ID'},
                                            {field: 'localStreamName', sortable: true, title: 'LocalStreamName'},
                                            {field: 'groupName', sortable: true, title: 'Group Name'}

                                        ]
                                    },
                                }
                                $scope.tableConfigData.dash.columnCollection.push(actionColumn);
                                $scope.tableConfigData.dash.rowConfigData = [];
                            }else if(configTypeSelected == 'hls'){
                                $scope.tableConfigData = {
                                    hls: {
                                        columnCollection: [
                                            {field: 'configId', sortable: true, title: 'Config ID'},
                                            {field: 'localStreamName', sortable: true, title: 'LocalStreamName'},
                                            {field: 'groupName', sortable: true, title: 'Group Name'}

                                        ]
                                    },
                                }
                                $scope.tableConfigData.hls.columnCollection.push(actionColumn);
                                $scope.tableConfigData.hls.rowConfigData = [];
                            }else if(configTypeSelected == 'mss'){
                                $scope.tableConfigData = {
                                    mss: {
                                        columnCollection: [
                                            {field: 'configId', sortable: true, title: 'Config ID'},
                                            {field: 'localStreamName', sortable: true, title: 'LocalStreamName'},
                                            {field: 'groupName', sortable: true, title: 'Group Name'}

                                        ]
                                    },
                                }
                                $scope.tableConfigData.mss.columnCollection.push(actionColumn);
                                $scope.tableConfigData.mss.rowConfigData = [];
                            }else if(configTypeSelected == 'hds'){
                                $scope.tableConfigData = {
                                    hds: {
                                        columnCollection: [
                                            {field: 'configId', sortable: true, title: 'Config ID'},
                                            {field: 'localStreamName', sortable: true, title: 'LocalStreamName'},
                                            {field: 'groupName', sortable: true, title: 'Group Name'}

                                        ]
                                    },
                                }
                                $scope.tableConfigData.hds.columnCollection.push(actionColumn);
                                $scope.tableConfigData.hds.rowConfigData = [];
                            }else if(configTypeSelected == 'process'){
                                $scope.tableConfigData = {
                                    process: {
                                        columnCollection: [
                                            {field: 'configId', sortable: true, title: 'Config ID'},
                                            {field: 'localStreamName', sortable: true, title: 'LocalStreamName'},
                                            {field: 'fullBinaryPath', sortable: true, title: 'fullBinaryPath'}
                                        ]
                                    },
                                }
                                $scope.tableConfigData.process.columnCollection.push(actionColumn);
                                $scope.tableConfigData.process.rowConfigData = [];
                            }else if(configTypeSelected == 'pull'){
                                $scope.tableConfigData = {
                                    pull: {
                                        columnCollection: [
                                            {field: 'configId', sortable: true, title: 'Config ID'},
                                            {field: 'localStreamName', sortable: true, title: 'LocalStreamName'},
                                            {field: 'sourceURI', sortable: true, title: 'Source URI'}
                                        ]
                                    },
                                }
                                $scope.tableConfigData.pull.columnCollection.push(actionColumn);
                                $scope.tableConfigData.pull.rowConfigData = [];
                            }else if(configTypeSelected == 'push'){
                                $scope.tableConfigData = {
                                    push: {
                                        columnCollection: [
                                            {field: 'configId', sortable: true, title: 'Config ID'},
                                            {field: 'localStreamName', sortable: true, title: 'LocalStreamName'},
                                            {field: 'targetUri', sortable: true, title: 'TargetUri'},
                                            {field: 'targetStreamName', sortable: true, title: 'TargetStreamName'}
                                        ]
                                    },
                                }
                                $scope.tableConfigData.push.columnCollection.push(actionColumn);
                                $scope.tableConfigData.push.rowConfigData = [];
                            }else if(configTypeSelected == 'record'){
                                $scope.tableConfigData = {
                                    record: {
                                        columnCollection: [
                                            {field: 'configId', sortable: true, title: 'Config ID'},
                                            {field: 'localStreamName', sortable: true, title: 'LocalStreamName'},
                                            {field: 'pathToFile', sortable: true, title: 'PathToFile'},
                                            {field: 'type', sortable: true, title: 'Type'}
                                        ]
                                    },
                                }
                                $scope.tableConfigData.record.columnCollection.push(actionColumn);
                                $scope.tableConfigData.webrecordrtc.rowConfigData = [];
                            }else if(configTypeSelected == 'webrtc'){
                                $scope.tableConfigData = {
                                    webrtc: {
                                        columnCollection: [
                                            {field: 'configId', sortable: true, title: 'Config ID'},
                                            {field: 'ersip', sortable: true, title: 'ERS IP'},
                                            {field: 'ersport', sortable: true, title: 'ERS Port'},
                                            {field: 'roomid', sortable: true, title: 'Room ID'}


                                        ]
                                    },
                                }
                                $scope.tableConfigData.webrtc.columnCollection.push(actionColumn);
                                $scope.tableConfigData.webrtc.rowConfigData = [];
                            }

                            for (var y in settingsData) {
                                var sourceURI = "";

                                if (settingsData[y].uri !== 'undefined') {
                                    sourceURI = settingsData[y].uri;
                                }

                                var localStreamName = "";
                                if (settingsData[y].localStreamName !== 'undefined') {
                                    localStreamName = settingsData[y].localStreamName;
                                }

                                //if for each config type
                                if(configTypeSelected == 'dash'){

                                    $scope.tableConfigData.dash.rowConfigData.push({
                                        "configId": settingsData[y].configId,
                                        "localStreamName": localStreamName,
                                        "groupName": settingsData[y].groupName
                                    });
                                }else if(configTypeSelected == 'hls'){
                                    $scope.tableConfigData.hls.rowConfigData.push({
                                        "configId": settingsData[y].configId,
                                        "localStreamName": localStreamName,
                                        "groupName": settingsData[y].groupName
                                    });
                                }else if(configTypeSelected == 'mss'){
                                    $scope.tableConfigData.mss.rowConfigData.push({
                                        "configId": settingsData[y].configId,
                                        "localStreamName": localStreamName,
                                        "groupName": settingsData[y].groupName
                                    });
                                }else if(configTypeSelected == 'hds'){
                                    $scope.tableConfigData.hds.rowConfigData.push({
                                        "configId": settingsData[y].configId,
                                        "localStreamName": localStreamName,
                                        "groupName": settingsData[y].groupName
                                    });
                                }else if(configTypeSelected == 'process'){
                                    $scope.tableConfigData.process.rowConfigData.push({
                                        "configId": settingsData[y].configId,
                                        "localStreamName": localStreamName,
                                        "fullBinaryPath": settingsData[y].fullBinaryPath
                                    });
                                }else if(configTypeSelected == 'pull'){
                                    $scope.tableConfigData.pull.rowConfigData.push({
                                        "configId": settingsData[y].configId,
                                        "localStreamName": localStreamName,
                                        "sourceURI": sourceURI
                                    });
                                }else if(configTypeSelected == 'push'){
                                    $scope.tableConfigData.push.rowConfigData.push({
                                        "configId": settingsData[y].configId,
                                        "localStreamName": localStreamName,
                                        "targetUri": settingsData[y].targetUri,
                                        "targetStreamName": settingsData[y].targetStreamName
                                    });
                                }else if(configTypeSelected == 'record'){
                                    $scope.tableConfigData.record.rowConfigData.push({
                                        "configId": settingsData[y].configId,
                                        "localStreamName": localStreamName,
                                        "pathToFile": settingsData[y].pathToFile,
                                        "type": settingsData[y].type
                                    });
                                }else if(configTypeSelected == 'webrtc'){
                                    $scope.tableConfigData.webrtc.rowConfigData.push({
                                        "configId": settingsData[y].configId,
                                        "ersip": settingsData[y].ersip,
                                        "ersport": settingsData[y].ersport,
                                        "roomid": settingsData[y].roomid
                                    });
                                }


                            }
                        }else{
                            $scope.tableConfigData = [];
                        }


                    }
                }


                var pageSize = 7;
                var pageNumber = 1;
                if($scope.bsConfigTableControl){
                    if(typeof $scope.bsConfigTableControl.state != 'undefined' ){
                        pageSize = $scope.bsConfigTableControl.state.pageSize;
                        pageNumber = $scope.bsConfigTableControl.state.pageNumber;
                    }
                }

                var bsTableData = null;

                if (configTypeSelected  == 'dash') {
                    bsTableData = $scope.tableConfigData.dash;
                } else if (configTypeSelected  == 'hds') {
                    bsTableData = $scope.tableConfigData.hds;
                } else if (configTypeSelected  == 'hls') {
                    bsTableData = $scope.tableConfigData.hls;
                } else if (configTypeSelected  == 'mss') {
                    bsTableData = $scope.tableConfigData.mss;
                } else if (configTypeSelected  == 'process') {
                    bsTableData = $scope.tableConfigData.process;
                } else if (configTypeSelected  == 'pull') {
                    bsTableData = $scope.tableConfigData.pull;
                } else if (configTypeSelected  == 'push') {
                    bsTableData = $scope.tableConfigData.push;
                } else if (configTypeSelected  == 'record') {
                    bsTableData = $scope.tableConfigData.record;
                } else if (configTypeSelected  == 'webrtc') {
                    bsTableData = $scope.tableConfigData.webrtc;
                }

                //Build the Table
                $scope.bsConfigTableControl = {
                    options: {
                        data: bsTableData.rowConfigData,
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

                $scope.configType.selected = configTypeSelected;

            }
        });
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


    $scope.configInfoModal = function (configTypeSelected, settingsInfo, rowHeaderConfig) {

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

                    var configRowBasic = settingsInfo ;

                    return configRowBasic;
                },
                configRowCurrent: function () {

                    var configRowCurrent = [];
                    configRowCurrent.header = 'Status: Current';
                    configRowCurrent.content = settingsInfo.status.current;

                    return configRowCurrent;
                },
                configRowPrevious: function () {

                    var configRowPrevious = [];
                    configRowPrevious.header = 'Status: Previous';
                    configRowPrevious.content = settingsInfo.status.previous;

                    return configRowPrevious;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $location.path('/config/'+$scope.configType.selected);
        }, function () {

        });

    }

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


webuiApp.controller('configInfoModalCtrl', ['$scope', '$uibModal', '$uibModalInstance', '$window' , '$base64', 'configTypeSelected', 'configRowHeaders', 'configRowBasic', 'configRowCurrent', 'configRowPrevious', function ($scope, $uibModal, $uibModalInstance, $window, $base64, configTypeSelected, configRowHeaders, configRowBasic, configRowCurrent, configRowPrevious) {

    $scope.configRowBasicNoArray = [];
    $scope.configRowBasicNoArray.content = {};

    for (var i in configRowBasic) {
        if ( configRowBasic.status == configRowBasic[i] ) {
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
    var configTypetoPlay = ["pull", "hls", "hds", "mss", "dash"];

    var playStream = configTypetoPlay.indexOf(configTypeSelected);

    $scope.showPlay = false;

    if(playStream != -1){

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
        console.log('configConfirmDeleteModalCtrl ok');

        $http.get("/ems/api/removeconfig?configid=" + configId).then(function (response) {

            $uibModalInstance.close();

        });
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

}]);