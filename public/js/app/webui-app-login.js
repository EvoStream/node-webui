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

    console.log('welcomeCtrl loaded ');

    $scope.connectionStatus = 'disconnected';
    $scope.connectionText = 'EMS Offline. Please Start EMS.';

    // var compareTo = function() {
    //     return {
    //         require: "ngModel",
    //         scope: {
    //             otherModelValue: "=compareTo"
    //         },
    //         link: function(scope, element, attributes, ngModel) {
    //
    //             ngModel.$validators.compareTo = function(modelValue) {
    //                 return modelValue == scope.otherModelValue;
    //             };
    //
    //             scope.$watch("otherModelValue", function() {
    //                 ngModel.$validate();
    //             });
    //         }
    //     };
    // };
    //
    // module.directive("compareTo", compareTo);

}]);





