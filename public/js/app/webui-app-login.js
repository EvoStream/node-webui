var webuiApp = angular.module('webui-app', ['ngSanitize']);

webuiApp.config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');
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

webuiApp.controller('welcomeCtrl', ['$scope' , function ($scope) {

    $scope.connectionStatus = 'disconnected';
    $scope.connectionText = 'EMS Offline. Please Start EMS.';

}]);





