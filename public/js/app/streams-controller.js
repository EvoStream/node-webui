// webuiApp.controller('streamsCtrl', ['$scope', '$http', '$timeout', '$location', function ($scope, $http, $timeout, $location) {
webuiApp.controller('streamsCtrl', ['$scope', '$http', '$timeout', '$location', 'listPullStreamFactory', function ($scope, $http, $timeout, $location, listPullStreamFactory) {

    console.log('streamsCtrl loaded');

    //Select the Tab
    // $scope.activeTab = '/active';

    // console.log('streamsCtrl output '+JSON.stringify(listPullStreamFactory.updateListStreams()));
    //
    // $scope.listPullStreamFactory = listPullStreamFactory;

    console.log('$location.path() '+$location.path());

    $scope.streamsNotAvailable = false;

    $scope.go = function (hash) {
        $location.path(hash);
        console.log('hash ' + hash);

        $scope.activeTab = hash;
    };


    if($location.path() == ''){
        console.log('default');
        $scope.activeTab = '/active';
    }else{
        $scope.go($location.path());
    }

}]);





