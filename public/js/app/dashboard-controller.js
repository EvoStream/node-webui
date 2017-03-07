webuiApp.controller('dashboardCtrl', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {

    console.log('dashboardCtrl loaded');
    $scope.licenseId = null;
    $scope.emsVersion = null;
    $scope.buildNumber = null;
    $scope.streamCount = null;


    $http.get("/ems/api/check-connection").then(function (response) {

        console.log('response ' + JSON.stringify(response));

        var data = response.data.data;

        if (data != null) {
            $scope.emsVersion = data.releaseNumber;
            $scope.buildNumber = data.buildNumber;

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
            
        } else {
            $scope.emsVersion = null;
            $scope.buildNumber = null;
        }

    });
    
}]);


