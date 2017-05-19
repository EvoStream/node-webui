'use strict';
var webuiApp = angular.module('webui-app', ['ngSanitize', 'ui.select', 'ngRoute', 'bsTable', 'ui.bootstrap', 'base64', 'angular-ladda', 'chart.js']);


webuiApp.config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');
});

webuiApp.config(function (laddaProvider) {
    laddaProvider.setOption({ /* optional */
        style: 'expand-right',
        spinnerSize: 18,
        spinnerColor: '#ffffff'
    });
});

webuiApp.directive('passwordCheck', function() {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            var firstPassword = '#' + attrs.passwordCheck;
            elem.add(firstPassword).on('keyup', function () {
                scope.$apply(function () {
                    var v = elem.val()===$(firstPassword).val();
                    ctrl.$setValidity('passwordMatch', v);
                });
            });
        }
    }
});

webuiApp.config(function ($routeProvider) {
    $routeProvider
        .when('/add', {
            templateUrl: '/js/app/streams/add/streams-add.html',
            controller: 'streamsAddCtrl',
            controllerAs: 'vm'
        })
        .when('/send', {
            templateUrl: '/js/app/streams/send/streams-send.html',
            controller: 'streamsSendCtrl',
            controllerAs: 'vm'
        })
        .when('/fblive', {
            templateUrl: '/js/app/streams/fblive/streams-fblive.html',
            controller: 'streamsFbLiveCtrl',
            controllerAs: 'vm'
        })

        .when('/youtube', {
            templateUrl: '/js/app/streams/youtube/streams-send-youtube.html',
            controller: 'streamsSendYoutubeCtrl',
            controllerAs: 'vm'
        })
        .when('/active/:streamTypeSelected?', { 
            templateUrl: '/js/app/streams/active/streams-active.html',
            controller: 'streamsActiveCtrl',
            controllerAs: 'vm'
        })
        .when('/config/:configTypeSelected?', {
            templateUrl: '/js/app/streams/config/streams-config.html',
            controller: 'streamsConfigCtrl',
            controllerAs: 'vm'
        })
        .when('/vod/', {
            templateUrl: '/js/app/streams/vod/streams-vod.html',
            controller: 'streamsVodCtrl',
            controllerAs: 'vm'
        })
        .otherwise('/active', {
            templateUrl: '/js/app/streams/active/streams-active.html',
            controller: 'streamsActiveCtrl',
            controllerAs: 'vm'
        });
});

webuiApp.filter('propsFilter', function () {
    return function (items, props) {
        var out = [];

        if (angular.isArray(items)) {
            var keys = Object.keys(props);

            items.forEach(function (item) {
                var itemMatches = false;

                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if(item[prop]){
                        if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                            itemMatches = true;
                            break;
                        }
                    }

                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
});


webuiApp.factory('listPullStreamFactory', [ '$http', '$q', function ($http, $q) {

    var factory = {};

    factory.updateListStreams = function () {
        var deferred = $q.defer();
        var inboundStreamList = [];

        $http.get("/ems/api/liststreams").then(function (response) {

            if (response.data.data != null) {
                var listStreamsDataTemp = response.data.data;

                for (var i in listStreamsDataTemp) {

                    if (listStreamsDataTemp[i].type.charAt(0) == 'I' && listStreamsDataTemp[i].type != 'IFR' && listStreamsDataTemp[i].type != 'IFP') {

                        var obj = {};

                        obj['name'] = listStreamsDataTemp[i].name;
                        obj['sourceUri'] = 'inbound';

                        if (listStreamsDataTemp[i].hasOwnProperty('pullSettings')) {
                            obj['sourceUri'] = listStreamsDataTemp[i].pullSettings.uri;
                        }

                        inboundStreamList.push(obj);
                    }
                }
            }

            deferred.resolve(inboundStreamList);

        });

        return deferred.promise;
    };


    return factory;

}]);

webuiApp.controller('connectionButtonCtrl', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout ) {

    $scope.connectionStatus = 'disconnected';
    $scope.connectionText = 'EMS Offline. Please Start EMS.';
    $scope.licenseId = null;
    $scope.emsVersion = null;
    $scope.buildNumber = null;
    $scope.streamCount = null;
    
    checkEmsConnection();
    function checkEmsConnection() {
        $http.get("/ems/api/check-connection").then(function (response) {

            var data = response.data;

            if (data.code == "ECONNREFUSED") {
                $scope.connectionStatus = 'disconnected';
                $scope.connectionText = 'EMS Offline. Please Start EMS.';
                $scope.dashboardConnectionText = 'Not Connected. Please Start EMS.';
                $scope.statusConnected = 'status';
            }

            if(data.status == "SUCCESS"){
                $scope.connectionStatus = '';
                $scope.connectionText = 'EMS ONLINE';
                $scope.dashboardConnectionText = 'CONNECTED';
                $scope.statusConnected = 'statusConnected';

                var dataInfo = response.data.data;

                $scope.emsVersion = dataInfo.releaseNumber;
                $scope.buildNumber = dataInfo.buildNumber;

                $http.get("/ems/api/get-inbound-outbound-count").then(function (response) {

                    $scope.streamCount = response.data;

                    $scope.labels = ['Stream Count Chart'];
                    $scope.series = ['Stream Count'];

                    $scope.dataCount = [
                        [$scope.streamCount.inbound],
                        [$scope.streamCount.outbound],
                        [$scope.streamCount.http]
                    ];

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

                    var data = response.data.data;

                    if (data != null) {
                        $scope.licenseId = data.licenseId;
                    } else {
                        $scope.licenseId = null;
                    }

                });

            }else{
                $scope.connectionStatus = 'disconnected';
                $scope.connectionText = 'EMS OFFLINE';
                $scope.dashboardConnectionText = 'NOT CONNECTED. Please Start EMS.';
                $scope.statusConnected = 'status';
            }

            $timeout(function () {
                // console.log("$timeout triggered");
                checkEmsConnection();
            }, 10000);
        });
    }
}]);

