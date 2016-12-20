webuiApp.controller('streamsSendYoutubeCtrl', ['$scope', '$http', '$timeout', 'listPullStreamFactory', '$uibModal', function ($scope, $http, $timeout, listPullStreamFactory, $uibModal) {

    console.log('streamsSendYoutubeCtrl loaded');

    $scope.activeTab = '/youtube';

    $scope.seeYtForm = false;


    $http.get('/users/check-google-login').then(function (response) {


        console.log('response ' + JSON.stringify(response));

        console.log('response.data.status '+response.data.status );

        if(response.data.status == 'login'){

            $scope.seeYtForm = true;

            /*
             * Default Values
             */

            $scope.seeAddedSendStream = false;
            $scope.ytButtonText = 'Send Stream to Youtube';

            //Get the List of Inbound Streams
            $scope.ytInboundList = [];
            listPullStreamFactory.updateListStreams().then(function (data) {
                console.log('streamsSendCtrl output ' + JSON.stringify(data));

                //build the ui select list
                $scope.ytInboundList = data;
                $scope.ytInboundList.selected = $scope.ytInboundList[0];

                if($scope.ytInboundList.length < 1){
                    $scope.streamsNotAvailable = true;
                }
            });

            //Dropdown List for Privacy Status
            $scope.ytPrivacyStatus = [
                {
                    value: "private",
                    text: "Private",
                },
                {
                    value: "public",
                    text: "Public",
                },
                {
                    value: "unlisted",
                    text: "Unlisted",
                }
            ];
            // Set default value for Privacy Status
            $scope.ytPrivacyStatus.selected = $scope.ytPrivacyStatus[0];

            //Dropdown List for Format
            $scope.ytFormatVideo = [
                {
                    value: "1440p",
                    text: "6 Mbps -13 Mbps (1440p)",
                },
                {
                    value: "1080p",
                    text: "3000 Kbps - 6000 Kbps (1080p)",
                },
                {
                    value: "720p",
                    text: "1500 Kbps -4000 Kbps (720p)",
                },
                {
                    value: "480p",
                    text: "500 Kbps - 2000 Kbps (480p)",
                },
                {
                    value: "360p",
                    text: "400 Kbps - 1000 Kbps (360p)",
                },
                {
                    value: "240p",
                    text: "300 Kbps - 700 Kbps (240p)",
                },
            ];
            // Set default value for Privacy Status
            $scope.ytFormatVideo.selected = $scope.ytFormatVideo[5];


            /*
             * Datepicker popup
             */

            // $scope.today = function () {
            //
            //     var now = new Date();
            //     var nowUTC = new Date(now.toUTCString());
            //
            //     $scope.ytStartDateTime = nowUTC;
            //     $scope.ytEndDateTime = nowUTC;
            //
            // };
            // $scope.today();

            // $scope.clear = function () {
            //     $scope.ytStartDateTime = null;
            //     $scope.ytEndDateTime = null;
            // };

            // $scope.inlineOptions = {
            //     customClass: getDayClass,
            //     minDate: new Date(),
            //     showWeeks: false
            // };

            // $scope.dateOptions = {
            //     // dateDisabled: disabled,
            //     formatYear: 'yy',
            //     maxDate: new Date(2020, 5, 22),
            //     minDate: new Date(),
            //     startingDay: 1,
            //     showWeeks: false
            // };

            // // Disable weekend selection
            // function disabled(data) {
            //     var date = data.date,
            //         mode = data.mode;
            //     return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
            // }

            // $scope.toggleMin = function () {
            //     $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
            //     $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
            // };
            //
            // $scope.toggleMin();

            // $scope.openYtStartDate = function () {
            //     $scope.openYtStartDate.opened = true;
            // };
            //
            // $scope.openYtEndDate = function () {
            //     $scope.openYtEndDate.opened = true;
            // };
            //
            // $scope.setDate = function (year, month, day) {
            //     $scope.ytStartDate = new Date(year, month, day);
            //     $scope.ytEndDate = new Date(year, month, day);
            // };
            //
            // $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
            // $scope.format = $scope.formats[0];
            // $scope.altInputFormats = ['M!/d!/yyyy'];


            // $scope.popupYtStartDate = {
            //     opened: false
            // };

            // $scope.popupYtEndDate = {
            //     opened: false
            // };

            // var tomorrow = new Date();
            // tomorrow.setDate(tomorrow.getDate() + 1);
            // var afterTomorrow = new Date();
            // afterTomorrow.setDate(tomorrow.getDate() + 1);
            // $scope.events = [
            //     {
            //         date: tomorrow,
            //         status: 'full'
            //     },
            //     {
            //         date: afterTomorrow,
            //         status: 'partially'
            //     }
            // ];

            // function getDayClass(data) {
            //     var date = data.date,
            //         mode = data.mode;
            //     if (mode === 'day') {
            //         var dayToCheck = new Date(date).setHours(0, 0, 0, 0);
            //
            //         for (var i = 0; i < $scope.events.length; i++) {
            //             var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);
            //
            //             if (dayToCheck === currentDay) {
            //                 return $scope.events[i].status;
            //             }
            //         }
            //     }
            //
            //     return '';
            // }


            /*
             * Timepicker
             */

            // $scope.hstep = 1;
            // $scope.mstep = 10;
            //
            // $scope.options = {
            //     hstep: [1, 2, 3],
            //     mstep: [1, 5, 10, 15, 25, 30]
            // };
            //
            // $scope.ismeridian = true;
            // $scope.toggleMode = function () {
            //     $scope.ismeridian = !$scope.ismeridian;
            // };

            // $scope.update = function () {
            //     var d = new Date();
            //     d.setHours(14);
            //     d.setMinutes(0);
            //     // $scope.mytime1 = d;
            //     $scope.ytStartTime = d;
            //     $scope.ytEndTime = d;
            // };

            // $scope.changed = function () {
            //     console.log('Time changed to: ' + $scope.mytime);
            // };

            // $scope.clear = function () {
            //     // $scope.mytime = null;
            //     $scope.ytStartTime = null;
            //     $scope.ytEndTime = null;
            // };



            $scope.sendYoutubeStream = function () {
                console.log('sendYoutubeStream sendYoutubeStream');

                $scope.sendYoutubeStreamLoading = true;
                $scope.ytButtonText = 'Sending.... ';

                // var temp = new Date($scope.ytStartDateTime.toUTCString());
                // var ytStartDateTimeISO = temp.toISOString();
                //
                // console.log('ytStartDateTimeISO '+ytStartDateTimeISO );
                //
                // var temp = new Date($scope.ytEndDateTime.toUTCString());
                // var ytEndDateTimeISO = temp.toISOString();
                //
                // console.log('ytEndDateTimeISO '+ytEndDateTimeISO );
                //
                // var parameters = {
                //     title: $scope.ytTitle,
                //     description: $scope.ytDescription,
                //     startTime: ytStartDateTimeISO,
                //     endTime: ytEndDateTimeISO,
                //     privacyStatus: $scope.ytPrivacyStatus.selected.value,
                //     format: $scope.ytFormatVideo.selected.value,
                // };

                //Set the Start Time and End Time to NOW
                var todayStart = new Date();
                var ytStartDateTimeISO = todayStart.toISOString();

                console.log('ytStartDateTimeISO '+ytStartDateTimeISO );

                var todayEnd = new Date();
                todayEnd.setHours(todayEnd.getHours()+1);
                var ytEndDateTimeISO = todayEnd.toISOString();

                console.log('ytEndDateTimeISO '+ytEndDateTimeISO );

                var parameters = {
                    title: $scope.ytTitle,
                    description: $scope.ytDescription,
                    startTime: ytStartDateTimeISO,
                    endTime: ytEndDateTimeISO,
                    privacyStatus: $scope.ytPrivacyStatus.selected.value,
                    format: $scope.ytFormatVideo.selected.value,
                };

                var data = $.param({
                    command: 'step01',
                    localStreamName: $scope.ytInboundList.selected.name,
                    parameters: $.param(parameters)
                });


                $http.get('/ems/api/send-youtube?' + data).then(function (response) {

                    console.log('response ' + JSON.stringify(response));

                    $scope.sendYoutubeStreamLoading = true;
                    $scope.ytButtonText = 'Changing Youtube Event Stream to Live Status...';

                    if (response.data.status){

                        var data = $.param({
                            command: 'step02',
                            broadcastId: response.data.broadcastId
                        });

                        $http.get('/ems/api/send-youtube?' + data).then(function (response) {

                            console.log('response ' + JSON.stringify(response));

                            $scope.sendYoutubeStreamLoading = false;
                            $scope.ytButtonText = 'Send Stream to Youtube';

                            if (response.data.status){

                                $scope.seeAddedSendStream = true;
                                $scope.youtubeStreamUrl = response.data.url;
                                $scope.setToDefaultValuesYoutubeStreamForm();

                            } else {
                                $scope.invalidArgumentModal();
                            }
                        });

                    } else {
                        $scope.invalidArgumentModal();
                        $scope.sendYoutubeStreamLoading = false;
                        $scope.ytButtonText = 'Send Stream to Youtube';
                    }
                });
            };

            $scope.setToDefaultValuesYoutubeStreamForm = function () {
                $scope.ytTitle = '';
                $scope.ytDescription = '';
                $scope.ytInboundList.selected = $scope.ytInboundList[0];
                $scope.ytPrivacyStatus.selected = $scope.ytPrivacyStatus[0];
                $scope.ytFormatVideo.selected = $scope.ytFormatVideo[5];
            };


            $scope.invalidArgumentModal = function () {


                var modalInstance = $uibModal.open({
                    templateUrl: 'js/app/streams/send/modals/invalid-params-streams-send.html',
                    controller: 'invalidArgumentModalCtrl',
                    resolve: {
                        sendStreamLoading: function () {
                            return $scope.sendStreamLoading;
                        }
                    }
                });

                modalInstance.result.then(function () {
                    // $ctrl.selected = selectedItem;
                    // $scope.sendStreamLoading = false;
                }, function () {
                    // $log.info('Modal dismissed at: ' + new Date());
                    $scope.sendStreamLoading = false;
                });
            };

        }

        // else{
        //     $scope.seeYtForm = false;
        // }

        console.log('01 LAST $scope.seeYtForm '+$scope.seeYtForm );

    });

    console.log('02 LAST $scope.seeYtForm '+$scope.seeYtForm );


}]);


webuiApp.controller('invalidArgumentModalCtrl', ['$scope', '$uibModalInstance', '$http', function ($scope, $uibModalInstance, $http) {

    // $scope.localStreamName = items;

    // $scope.delete = function () {
    //     console.log('confirmDeleteModalCtrl ok');
    //     // $uibModalInstance.dismiss('cancel');
    //
    //     $http.get("/ems/api/removeconfig?configid="+configId).then(function (response) {
    //
    //         console.log('response '+JSON.stringify(response));
    //
    //         $uibModalInstance.dismiss('cancel');
    //
    //     });
    //
    // };

    $scope.ok = function () {
        console.log('invalidArgumentModalCtrl ok');
        $scope.sendStreamLoading = false;
        $uibModalInstance.dismiss('ok');
    };

    $scope.cancel = function () {
        console.log('invalidArgumentModalCtrl cancel');
        $scope.sendStreamLoading = false;
        $uibModalInstance.dismiss('cancel');
    };

}]);


