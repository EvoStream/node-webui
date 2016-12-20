// webuiApp.controller('dashboardCtrl', ['$scope', '$http', '$timeout', 'chart.js', function ($scope, $http, $timeout) {
webuiApp.controller('dashboardCtrl', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {

    console.log('dashboardCtrl loaded');
    $scope.licenseId = null;
    $scope.emsVersion = null;
    $scope.buildNumber = null;
    $scope.streamCount = null;


    $http.get("/ems/api/get-inbound-outbound-count").then(function (response) {

        console.log('response ' + JSON.stringify(response));

        // var data = response.data.;

        $scope.streamCount = response.data;

        $scope.labels = ['Stream Count Chart'];
        $scope.series = ['Stream Count'];

        $scope.dataCount = [
            [$scope.streamCount.inbound],
            [$scope.streamCount.outbound],
            [$scope.streamCount.http]
        ];


        console.log('$scope.streamCount.inbound ' + $scope.streamCount.inbound);
        console.log('max $scope.dataCount '+Math.max($scope.streamCount.inbound, $scope.streamCount.outbound, $scope.streamCount.http ));

        $scope.datasetOverride = [{yAxisID: 'y-axis-1'}];


        var maxValue = Math.max($scope.streamCount.inbound, $scope.streamCount.outbound, $scope.streamCount.http ) + 1;


        $scope.options = {
            scales: {
                yAxes: [
                    {
                        id: 'y-axis-1',
                        display: true,
                        ticks: {
                            max: maxValue,
                            stepSize: 1,
                            beginAtZero: true   // minimum value will be 0.
                        }
                    }
                ]
            }
        };

    });


    $http.get("/ems/api/get-license-id").then(function (response) {

        console.log('response ' + JSON.stringify(response));

        var data = response.data.data;

        if (data != null) {
            $scope.licenseId = data.licenseId;
        } else {
            $scope.licenseId = null;
        }

        console.log('$scope.licenseId ' + $scope.licenseId);

    });

    $http.get("/ems/api/check-connection").then(function (response) {

        console.log('response ' + JSON.stringify(response));

        var data = response.data.data;

        if (data != null) {
            $scope.emsVersion = data.releaseNumber;
            $scope.buildNumber = data.buildNumber;
        } else {
            $scope.emsVersion = null;
            $scope.buildNumber = null;
        }

    });


    // $scope.serverIsOnline = false;
    //
    // console.log("$scope.serverIsOffline "+$scope.serverIsOffline);
    //
    // $scope.checkEmsConnection = function(){
    //     console.log("$scope.serverIsOffline "+$scope.serverIsOffline);
    // }

    // $timeout(function () {
    //     checkResponse()
    // }, 3000);

    // checkEmsConnection();
    // function checkEmsConnection() {
    //     $http.get("ems/api/check-connection").then(function (response) {
    //
    //         console.log(JSON.stringify(response));
    //
    //         var data = response.data;
    //
    //         if(data.code == "ECONNREFUSED"){
    //             return $scope.serverIsOnline = false;
    //         }
    //
    //         console.log("$scope.serverIsOnline "+$scope.serverIsOnline);
    //
    //         // else{
    //         //     if(data.status == "SUCCESS"){
    //         //
    //         //         $scope.serverIsOnline = true;
    //         //         console.log($scope.serverIsOnline);
    //         //     } else {
    //         //         $scope.serverIsOnline = false;
    //         //     }
    //         // }
    //         $timeout(function()  { checkEmsConnection()},  3000);
    //             // if (response.data.hasOwnProperty('status')) {
    //             //     if (!$scope.emsCommandLoads) {
    //             //         $scope.emsCommands = response.data.data;
    //             //         $scope.currentEmsCommand = response.data.data[0];
    //             //         $scope.currentEmsCommandName = response.data.data[0].command;
    //             //         $scope.emsCommandLoads = true;
    //             //     }
    //             //     $scope.serverIsOnline = true;
    //             // } else {
    //             //     $scope.serverIsOnline = false;
    //             // }
    //             // $timeout(function () {
    //             //     checkResponse()
    //             // }, 3000);
    //         }
    //     );
    // }


}]);


