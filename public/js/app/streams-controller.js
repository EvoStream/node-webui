webuiApp.controller('streamsCtrl', ['$scope', '$http', '$timeout', '$location', 'listPullStreamFactory', function ($scope, $http, $timeout, $location, listPullStreamFactory) {

    $scope.streamsNotAvailable = false;

    $scope.go = function (hash) {
        $location.path(hash);
        $scope.activeTab = hash;
    };

    if($location.path() == ''){
        $scope.activeTab = '/active';
    }else{
        $scope.go($location.path());
    }

}]);





