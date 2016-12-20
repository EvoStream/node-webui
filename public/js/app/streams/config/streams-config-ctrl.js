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

                //Set the columns
                $scope.columnConfigData = [
                    {field: 'configId', sortable: true, title: 'Stream ID'},
                    {field: 'localStreamName', sortable: true, title: 'LocalStreamName'},
                    {field: 'sourceURI', sortable: true, title: 'Source URI'},
                    {
                        field: 'operate',
                        title: 'Actions',
                        align: 'center',
                        width: '180',
                        clickToSelect: false,
                        formatter: configActionFormatter,
                        events: {
                            'click .info': function (e, value, row, index) {
                                console.log('INFO');

                                var settingsInfo = configData[configTypeSelected][index];

                                var rowHeaderConfig = $scope.rowConfigData[index];

                                console.log('settingsInfo '+ JSON.stringify(settingsInfo));
                                console.log('rowHeaderConfig '+ JSON.stringify(rowHeaderConfig));

                                $scope.configInfoModal($scope.configType.selected, settingsInfo, rowHeaderConfig);

                            },
                            'click .delete': function (e, value, row, index) {
                                console.log('DELETE');

                                var rowHeaderConfig = $scope.rowConfigData[index];

                                $scope.configDeleteModal(rowHeaderConfig);

                            }
                        }
                    }
                ];

                // console.log(' '+ JSON.stringify(configData));

                //Set the Rows
                $scope.rowConfigData = [];

                //Set the Config Type Dropdown Filter
                for (var i in configData) {

                    console.log('i ' + i);

                    //Create the dropdown
                    $scope.configType.push(i);
                    $scope.configType.selected = configTypeSelected;

                    console.log('configData[i] ' + JSON.stringify(configData[i]));

                    if (i == configTypeSelected) {

                        var settingsData = configData[i];

                        if(settingsData.length > 0){
                            for (var y in settingsData) {
                                var sourceURI = "";

                                console.log('y ' + y);

                                if (settingsData[y].uri !== 'undefined') {
                                    sourceURI = settingsData[y].uri;
                                }

                                var localStreamName = "";
                                if (settingsData[y].localStreamName !== 'undefined') {
                                    localStreamName = settingsData[y].localStreamName;
                                }

                                $scope.rowConfigData.push({
                                    "configId": settingsData[y].configId,
                                    "localStreamName": localStreamName,
                                    "sourceURI": sourceURI
                                });
                            }


                        }else{
                            $scope.rowConfigData = [];
                        }
                        
                        //Build the Table
                        $scope.bsConfigTableControl = {
                            options: {
                                data: $scope.rowConfigData,
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
                                columns: $scope.columnConfigData
                            }
                        };

                    }

                }



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

        console.log('configInfoModal configInfoModal ');

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
            // $ctrl.selected = selectedItem;
            // $route.reload();
            // listConfigs($scope.configType.selected);
            $location.path('/config/'+$scope.configType.selected);
            // listConfigs($scope.configType.selected);
        }, function () {

        });

    }

    $scope.configDeleteModal = function (rowHeaderConfig) {

        console.log('deleteModal deleteModal');

        var modalInstance = $uibModal.open({
            templateUrl: 'js/app/streams/config/modals/delete-streams-config.html',
            controller: 'configConfirmDeleteModalCtrl',
            resolve: {
                configId: function () {

                    var configId = rowHeaderConfig.configId;

                    console.log('configId ' + configId);

                    return configId;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            // $ctrl.selected = selectedItem;
            // $route.reload();
            listConfigs($scope.configType.selected);
        }, function () {
            // $log.info('Modal dismissed at: ' + new Date());
        });
    };



}]);


webuiApp.controller('configInfoModalCtrl', ['$scope', '$uibModal', '$uibModalInstance', '$window' , '$base64', 'configTypeSelected', 'configRowHeaders', 'configRowBasic', 'configRowCurrent', 'configRowPrevious', function ($scope, $uibModal, $uibModalInstance, $window, $base64, configTypeSelected, configRowHeaders, configRowBasic, configRowCurrent, configRowPrevious) {

    console.log('configInfoModalCtrl configInfoModalCtrl ');

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
        console.log('infoModalCtrl cancel');
        $uibModalInstance.dismiss('cancel');
    };


    //Only show Play button on Inbound and HTTP Streams
    var configTypetoPlay = ["pull", "hls", "hds", "mss", "dash"];

    var playStream = configTypetoPlay.indexOf(configTypeSelected);

    $scope.showPlay = false;

    console.log('playStream '+ playStream);

    if(playStream != -1){

        $scope.showPlay = true;

        // $scope.play(configRowHeaders);

        $scope.playConfig = function () {

            var infoRaw = configRowHeaders;
            infoRaw.streamFormat = configTypeSelected.toUpperCase();

            if (configTypeSelected.toUpperCase() == 'DASH' || configTypeSelected.toUpperCase() == 'HLS') {
                infoRaw.groupName = configRowBasic.groupName
            }

            var info = $base64.encode(JSON.stringify(infoRaw));
            $window.open("/streams/play?info=" + info, 'windowOpenTab' + info, 'scrollbars=0,resizable=0,width=800,height=630,left=0,top=0');
        };
    }

    $scope.delete = function () {
        console.log('delete delete');


        var modalInstance = $uibModal.open({
            templateUrl: 'js/app/streams/config/modals/delete-streams-config.html',
            controller: 'configConfirmDeleteModalCtrl',
            resolve: {
                configId: function () {

                    var configId = $scope.configRowHeaders.configId;

                    console.log('configId ' + configId);

                    return configId;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            // $ctrl.selected = selectedItem;
            $uibModalInstance.close();
        }, function () {
            // $log.info('Modal dismissed at: ' + new Date());
        });
    };



}]);


webuiApp.controller('configConfirmDeleteModalCtrl', ['$scope', '$uibModalInstance', '$http', 'configId', function ($scope, $uibModalInstance, $http, configId) {

    // $scope.localStreamName = items;

    $scope.deleteConfigId = configId;

    $scope.delete = function () {
        console.log('configConfirmDeleteModalCtrl ok');
        // $uibModalInstance.dismiss('cancel');

        $http.get("/ems/api/removeconfig?configid=" + configId).then(function (response) {

            console.log('response ' + JSON.stringify(response));

            $uibModalInstance.close();

        });

    };

    $scope.cancel = function () {
        console.log('confirmDeleteModalCtrl cancel');
        $uibModalInstance.dismiss('cancel');
    };

}]);