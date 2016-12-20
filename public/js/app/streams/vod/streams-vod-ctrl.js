// webuiApp.controller('streamsActiveCtrl', ['$scope', '$http', '$timeout', 'listStreamFactory', function ($scope, $http, listStreamFactory) {
// webuiApp.controller('streamsActiveCtrl', ['$scope', '$http', '$timeout', function ($scope, $http) {
webuiApp.controller('streamsVodCtrl', ['$uibModal', '$scope', '$http', '$timeout', '$window', '$base64', '$routeParams', function ($uibModal, $scope, $http, $timeout, $window, $base64, $routeParams) {

    console.log('streamsVodCtrl loaded');

    //Select the Tab
    $scope.activeTab = '/vod';

    //Select the Inbound Stream Table
    // $scope.streamTypeSelected = 'inbound';

    // var vm = this;

    $scope.vodMediaFolder = '';
    $scope.loadFilesText = 'Load the Files';
    $scope.loadFilesLoading = false;
    $scope.noFilesFound = false;
    $scope.seeVodErrorMessage = false;

    //
    // vm.disabled = false;
    // vm.searchEnabled = true;
    //
    // console.log('starting $scope.streamTypeSelected ' + $scope.streamTypeSelected);
    // console.log('starting $routeParams ' + JSON.stringify($routeParams));

    $http.get("/ems/api/get-default-media-folder").then(function (response) {

        console.log('get-default-media-folder response ' + JSON.stringify(response));

        var defaultMediaFolder = response.data;

        console.log('defaultMediaFolder ' + defaultMediaFolder);

        $scope.vodMediaFolder = defaultMediaFolder;

        $scope.loadFiles();


    });

    $scope.loadFiles = function () {

        $scope.loadFilesLoading = true;
        $scope.seeVodErrorMessage = false;

        if ($scope.vodMediaFolder == '') {
            $scope.seeVodErrorMessage = true;
            $scope.loadFilesLoading = false;
        } else {
            var data = $.param({
                directory: $scope.vodMediaFolder
            });

            $http({
                method: 'POST',
                url: '/ems/api/get-vod-files',
                data: data,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function (response) {

                console.log('response ' + JSON.stringify(response));

                var listFiles = response.data;

                $scope.loadFilesLoading = false;

                //Build the Column
                $scope.columnVodData = [
                    {field: 'file', sortable: true, title: 'File Name'},
                    {
                        field: 'operate',
                        title: 'Actions',
                        align: 'center',
                        width: '180',
                        clickToSelect: false,
                        formatter: vodActionFormatter,
                        events: {
                            'click .play': function (e, value, row, index) {
                                console.log('PLAY');
                                row.streamFormat = 'VOD';
                                $scope.playVod(row);
                            },
                            'click .delete': function (e, value, row, index) {
                                console.log('DELETE');

                                $scope.deleteVod(row);

                            },
                        }
                    }
                ];

                //Set the Rows
                $scope.rowVodData = [];

                for (var i in listFiles) {
                    $scope.rowVodData.push({
                        "file": listFiles[i]
                    });
                }

                console.log('listFiles ' + JSON.stringify(listFiles));
                console.log('$scope.rowVodData ' + JSON.stringify($scope.rowVodData));

                //Build the Table
                $scope.bsVodTableControl = {
                    options: {
                        data: $scope.rowVodData,
                        rowStyle: function (row, index) {
                            return {classes: 'none'};
                        },
                        cache: false,
                        height: 600,
                        striped: true,
                        pagination: true,
                        pageSize: 11,
                        pageList: [5, 10, 25, 50, 100, 200],
                        search: true,
                        showColumns: false,
                        showRefresh: false,
                        minimumCountColumns: 2,
                        clickToSelect: false,
                        showToggle: false,
                        maintainSelected: true,
                        dataSortOrder: "desc",
                        columns: $scope.columnVodData
                    }
                };

                $scope.loadFilesLoading = false;
            });
        }
    }

    $scope.playVod = function (row) {

        console.log('row ' + JSON.stringify(row));

        var info = $base64.encode(JSON.stringify(row));
        $window.open("/streams/play?info=" + info, 'windowOpenTab' + info, 'scrollbars=0,resizable=0,width=800,height=630,left=0,top=0');
    };


    $scope.deleteVod = function (row) {

        // $scope.vodMediaFolder;

        //add trailing slash to directory (if not present)
        var lastChar = $scope.vodMediaFolder.substr(-1); // Selects the last character
        if (lastChar != '/') {         // If the last character is not a slash
            $scope.vodMediaFolder = $scope.vodMediaFolder + '/';            // Append a slash to it.
        }

        var filePath = $scope.vodMediaFolder + row.file;

        console.log('filePath '+filePath );

        var modalInstance = $uibModal.open({
            templateUrl: 'js/app/streams/vod/modals/delete-streams-vod.html',
            controller: 'confirmDeleteVodModalCtrl',
            resolve: {
                filepath: function () {
                    return filePath;
                }
            }
        });

        modalInstance.result.then(function (result) {
            // $ctrl.selected = selectedItem;
            console.log('deleteVod result.then result '+ JSON.stringify(result));

            if(result != filePath){
                //create error message
            }

            $scope.loadFiles();
        }, function () {
            // $log.info('Modal dismissed at: ' + new Date());
        });
    };


    function vodActionFormatter(value, row, index) {

        var actionFormatterValue = [
            '<a class="play ml10"  href="javascript:void(0)"  title="Play">',
            '<i class="glyphicon glyphicon-play"></i>',
            '</a>',
            '<a class="delete ml10" href="javascript:void(0)"  title="Delete">',
            '<i class="glyphicon glyphicon-trash"></i>',
            '</a>',
        ].join('&nbsp;&nbsp;');

        return actionFormatterValue;
    }

}]);

webuiApp.controller('confirmDeleteVodModalCtrl', ['$scope', '$uibModalInstance', '$http', 'filepath', function ($scope, $uibModalInstance, $http, filepath) {

    $scope.deleteFilePath = filepath;

    $scope.delete = function () {
        console.log('confirmDeleteVodModalCtrl ok');
        // $uibModalInstance.dismiss('cancel');

        // $http.get("/ems/api/removeconfig?configid=" + configId).then(function (response) {
        //
        //     console.log('response ' + JSON.stringify(response));
        //
        //     $uibModalInstance.dismiss('cancel');
        //
        // });

        var data = $.param({
            filepath: filepath
        });

        $http({
            method: 'POST',
            url: '/ems/api/get-delete-vod-files',
            data: data,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function (response) {
            console.log('response '+ JSON.stringify(response));

            if(response.data == filepath){
                $uibModalInstance.close({$value: filepath});
            }else{
                $uibModalInstance.close({$value: JSON.stringify(response.data)});
            }
        });
    };

    $scope.cancel = function () {
        console.log('confirmDeleteVodModalCtrl cancel');
        $uibModalInstance.dismiss('cancel');
    };

}]);


