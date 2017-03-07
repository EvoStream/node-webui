webuiApp.controller('apiExplorerCtrl', ['$scope', '$http', '$timeout', '$window', function ($scope, $http, $timeout, $window) {

    console.log('apiExplorerCtrl loaded ');

    var vm = this;

    vm.disabled = false;
    vm.searchEnabled = true;


    vm.setInputFocus = function () {
        $scope.$broadcast('UiSelectDemo1');
    };

    $http.get("/ems/api/get-commands-parameters").then(function (response) {

            vm.apiList = response.data;
        }
    );

    $scope.sendCommandLoading = false;

    $scope.selectedCommandAddParameters = function () {

        var index = vm.apiList.findIndex(function (item, i) {
            return item.command === $scope.ctrl.api.selected;
        });

        $scope.selectedCommandName = vm.apiList[index].command;
        $scope.selectedCommandDescription = vm.apiList[index].description;

        console.log('$scope.selectedCommandDescription ' + $scope.selectedCommandDescription);

        $scope.selectedParameterDescriptionStatus = false;

        // console.log('vm.apiList[index].parameters' +JSON.stringify(vm.apiList[index].parameters));
        //
        // console.log('$scope.parameterList ' +JSON.stringify($scope.parameterList));
        // console.log('vm.apiList[index].parameters[0].name '+vm.apiList[index].parameters[0].name);

        // $scope.param = {selected : vm.apiList[index].parameters[0].name};
        // $scope.param.description = vm.apiList[index].parameters[0].description;

        $scope.parameterList = vm.apiList[index].parameters;

        $scope.parameterCollectionsMandatory = [];
        $scope.parameterListNotMandatory = [];
        var tempParameterListNotMandatory = [];
        $scope.parameterCollectionsNotMandatory = [];

        for (var i in $scope.parameterList) {

            if ($scope.parameterList[i].mandatory) {
                //mandatory parameters
                $scope.parameterCollectionsMandatory.push({
                    "id": i,
                    "listing": $scope.parameterList,
                    "defaultName": {selected: $scope.parameterList[i].name},
                    "defaultDescription": $scope.parameterList[i].description,
                    "defaultMandatory": $scope.parameterList[i].mandatory,
                });
            } else {
                $scope.parameterListNotMandatory.push($scope.parameterList[i]);
                tempParameterListNotMandatory.push($scope.parameterList[i]);
            }
        }

        $scope.indexParameterNotMandatory = 0;
        $scope.parameterCollectionsNotMandatory.push({
            "id": $scope.indexParameterNotMandatory,
            "listing": $scope.parameterListNotMandatory,
            // "defaultName": {selected: $scope.parameterListNotMandatory[$scope.indexParameterNotMandatory].name},
            // "defaultDescription": $scope.parameterListNotMandatory[$scope.indexParameterNotMandatory].description,
            // "defaultMandatory": $scope.parameterListNotMandatory[$scope.indexParameterNotMandatory].mandatory,
        });

        $scope.checkingParameterListNotMandatory = tempParameterListNotMandatory;


        // console.log('$scope.parameterCollections ' +JSON.stringify($scope.parameterCollections));


    };


    $scope.selectedParameterDescription = function (parameterCollection) {
        // parameterCollection.defaultValue.selected,

        var selectedParameterName = parameterCollection.defaultName.selected;
        console.log('selectedParameterName ' + selectedParameterName);

        var index = $scope.parameterListNotMandatory.findIndex(function (item, i) {
            return item.name === selectedParameterName;
        });


        console.log('index ' + index);
        // console.log('id '+id);
        console.log('selectedParameterDescription parameterCollection  ' + JSON.stringify(parameterCollection));

        var id = parameterCollection.id;
        console.log('id ' + id);

        console.log('$scope.parameterListNotMandatory[index].description ' + $scope.parameterListNotMandatory[index].description);

        if($scope.parameterCollectionsNotMandatory[id]){
            $scope.parameterCollectionsNotMandatory[id].listing = $scope.checkingParameterListNotMandatory;
            $scope.parameterCollectionsNotMandatory[id].selectedParameterDescriptionValue = $scope.parameterListNotMandatory[index].description;
            $scope.parameterCollectionsNotMandatory[id].selectedParameterMandatoryValue = $scope.parameterListNotMandatory[index].mandatory;
            $scope.parameterCollectionsNotMandatory[id].selectedParameterDescriptionStatus = true;

            console.log('AFTER $scope.parameterCollectionsNotMandatory ' + JSON.stringify($scope.parameterCollectionsNotMandatory));

            //Check List of Parameters Not Mandatory
            for (var i in $scope.checkingParameterListNotMandatory) {

                if ($scope.checkingParameterListNotMandatory[i].name == parameterCollection.defaultName.selected) {

                    //Remove the parameter
                    $scope.checkingParameterListNotMandatory.splice(i, 1);
                }
            }
        }




    };

    $scope.addParameterNotMandatory = function (parameterCollectionsNotMandatory) {

        console.log('addParameterNotMandatory addParameterNotMandatory');

        console.log('addParameterNotMandatory parameterCollectionsNotMandatory ' + JSON.stringify(parameterCollectionsNotMandatory));

        // $scope.parameterCollectionsNotMandatory.push(parameterCollectionsNotMandatory);


        var newIndex = parameterCollectionsNotMandatory.length;

        console.log('parameterCollectionsNotMandatory.length ' + parameterCollectionsNotMandatory.length);
        console.log('newIndex ' + newIndex);

        $scope.parameterCollectionsNotMandatory.push({
            "id": newIndex,
            "listing": $scope.checkingParameterListNotMandatory,
            // "defaultName": {selected: $scope.parameterListNotMandatory[$scope.indexParameterNotMandatory].name},
            // "defaultDescription": $scope.parameterListNotMandatory[$scope.indexParameterNotMandatory].description,
            // "defaultMandatory": $scope.parameterListNotMandatory[$scope.indexParameterNotMandatory].mandatory,
        });


        // if($scope.parameters.length > 0) {
        //     $scope.selectedParameters.push(param);
        //
        //     var index =  $scope.parameters.indexOf(param);
        //     $scope.parameters.splice(index, 1);
        // }

    };

    $scope.deleteParameterNotMandatory = function (parameterCollectionsNotMandatory, parameterCollection) {

        console.log('deleteParameterNotMandatory deleteParameterNotMandatory');
        console.log('deleteParameterNotMandatory parameterCollection ' + JSON.stringify(parameterCollection));
        console.log('deleteParameterNotMandatory parameterCollectionsNotMandatory ' + JSON.stringify(parameterCollectionsNotMandatory));

        var index = parameterCollectionsNotMandatory.findIndex(function (item, i) {

            if(parameterCollection.defaultName){
                return item.defaultName.selected === parameterCollection.defaultName.selected;
            }else{
                return 0;
            }

        });

        // var index = parameterCollection.id;


        console.log('deleteParameterNotMandatory index ' + index);

        $scope.parameterCollectionsNotMandatory.splice(index, 1);



        if(parameterCollection.defaultName){
            //Add the deleted parameter back to the listing of not mandatory parameters
            for (var i in $scope.parameterListNotMandatory) {

                if ($scope.parameterListNotMandatory[i].name == parameterCollection.defaultName.selected) {

                    //Add the parameter
                    $scope.checkingParameterListNotMandatory.push($scope.parameterListNotMandatory[i]);
                }
            }
        }

        console.log('$scope.parameterListNotMandatory '+ JSON.stringify($scope.parameterListNotMandatory));
        console.log('$scope.checkingParameterListNotMandatory '+ JSON.stringify($scope.checkingParameterListNotMandatory));


    };


    $scope.clearCommand = function () {
        vm.api.selected = undefined;
        $scope.selectedCommandDescription = undefined;
        $scope.selectedCommandName = undefined;
        $scope.parameterCollectionsMandatory.length = 0;
        $scope.parameterCollectionsNotMandatory.length = 0;
        $scope.commandResponse = '';

        $window.scrollTo(0, 0);
    };


    $scope.sendCommand = function () {
        console.log('sendCommand sendCommand');
        // console.log('parametersMandatory '+JSON.stringify($scope.parameterCollectionsMandatory));
        // console.log('parametersNotMandatory '+JSON.stringify($scope.parameterCollectionsNotMandatory));
        //

        var parameters = {};
        $scope.sendCommandLoading = true;
        $scope.commandResponse = '';

        if ($scope.parameterCollectionsMandatory.length > 0) {
            var parameterCollectionsMandatory = $scope.parameterCollectionsMandatory;
            angular.forEach(parameterCollectionsMandatory, function (parameterCollection, key) {

                parameters[parameterCollection.defaultName.selected] = parameterCollection.value;

            });
        }

        console.log('$scope.parameterCollectionsNotMandatory.length ' + $scope.parameterCollectionsNotMandatory.length);

        if ($scope.parameterCollectionsNotMandatory.length > 0) {
            var parameterCollectionsMandatory = $scope.parameterCollectionsNotMandatory;
            angular.forEach(parameterCollectionsMandatory, function (parameterCollection, key) {

                if (typeof parameterCollection.defaultName != 'undefined') {
                    parameters[parameterCollection.defaultName.selected] = parameterCollection.value;
                }


            });
        }

        console.log('parameters ' + JSON.stringify(parameters));

        // var params = $.param(parameters);

        // use $.param jQuery function to serialize data from JSON
        var data = $.param({
            command: $scope.selectedCommandName,
            parameters: $.param(parameters)
        });


        $http({
            method: 'POST',
            url: '/ems/api/execute-command',
            data: data,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function (response) {
            response['status'] = null;
            delete response['status'];
            response['config'] = null;
            delete response['config'];
            response['statusText'] = null;
            delete response['statusText'];

            $scope.commandResponse = angular.toJson(response, 18);
            $scope.sendCommandLoading = false;
        });

    };


}]);



