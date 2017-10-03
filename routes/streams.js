var express = require('express');
var router = express.Router();
var path = require('path');
var restrict = require(path.join(__dirname, '../auth/restrict'));
var winston = require('winston');
var async = require("async");

//build the api proxy
var ipApiProxy = require(path.join(__dirname, "../core_modules/ems-api-proxy"));
var ems = require(path.join(__dirname, "../core_modules/ems-api-core"))(ipApiProxy.url);

//load the socket.io
var socketApi = require(path.join(__dirname, '../core_modules/socket-io-api'));

//load the stream service
var streamService = require(path.join(__dirname, '../services/stream-service'));

//List the Events to be used
var listSreamsEvent = ['inStreamCreated', 'inStreamClosed', 'outStreamCreated', 'outStreamClosed'];
var listConfigEvent = ['processStarted', 'processStopped', 'recordChunkCreated', 'recordChunkClosed', 'webRtcServiceStarted', 'webRtcServiceStopped'];
listConfigEvent = listConfigEvent.concat(listSreamsEvent);

router.post('/update-list', function (req, res, next) {
    winston.log("info", '[webui] streams-route: update-list ');
    winston.log("verbose", '[webui] streams-route: update-list data - ' + JSON.stringify(req.body));

    var eventDataArray = [];
    eventDataArray.push(req.body);

    async.mapSeries(eventDataArray,
        function (eventData, callback) {

            var event = eventData;
            var eventType = eventData.type;

            async.series([function (seriescallback) {
                //for listconfig table
                if (listConfigEvent.indexOf(eventType) != -1) {
                    streamService.updateListConfigTable(event, function (response) {

                        socketApi.sendUpdateListConfigTable(response);
                        seriescallback(null, 'result of listconfig');

                    });
                } else {
                    seriescallback(null, 'result of listconfig');
                }


            }, function (seriescallback) {
                //for liststream table
                if (listSreamsEvent.indexOf(eventType) != -1) {
                    streamService.updateListStreamsTable(event, function (response) {

                        socketApi.sendUpdateListStreamsTable(response);
                        seriescallback(null, 'result of liststream');

                    });
                } else {
                    seriescallback(null, 'result of liststream');
                }

            }], function done(error, results) {
                if (error) {
                    winston.log("error", '[webui] streams-route: update-list failed: '+JSON.stringify(error));
                }

                winston.log("verbose", '[webui] streams-route: update-list data done: ' + JSON.stringify(results));

                callback();
            });


        },
        // function to call when everything's done
        function () {
            // all tasks are done now
            winston.log("info", '[webui] streams-route: update-list, all post data done');
        }
    );

});

/*
 * For further Development on loading config.lua
 */
// router.get('/view-configlua', function (req, res, next) {
//
//
//     var emsConfigLua = require(path.join(__dirname, "../core_modules/ems-config-core"));
//
// });


router.get('/update-liststream', function (req, res, next) {
    winston.log("info", '[webui] streams-route: update-liststream ');

    var data = null;

    streamService.updateListStreamsTable(data, function (response) {

        winston.log("info", "liststreamModel.update response " + JSON.stringify(response));

        res.json(response);

    });

});

router.get('/test-pullstream', function (req, res, next) {
    winston.log("info", '[webui] streams-route: test-pullstream ');

    var temp = "b";

    var streamNameArray = [];

    for (var i = 0; i < 200; i++) {

        var streamName = temp + i;
        streamNameArray.push(streamName);
    }

    async.mapSeries(streamNameArray,
        function (streamctr, callback) {

            var parameters = {
                uri: "rtmp://s2pchzxmtymn2k.cloudfront.net/cfx/st/mp4:sintel.mp4",
                localStreamName: streamctr
            };

            ems.pullStream(parameters, function (result) {
                if (result.status == 'SUCCESS') {
                    callback();
                }

            });

        },
        function () {
            winston.log("info", '[webui] streams-route: test-pullstream, all pullStream is done ');
            res.json("all pullStream is done ");
        }
    );


});


router.get('/', restrict, function (req, res, next) {
    winston.log("info", '[webui] streams-route: index ');

    var parameters = null;

    //Execute command for pushStream using destination address
    ems.version(parameters, function (result) {

        var view = 'admin/error';

        if (result.status == 'SUCCESS') {
            view = 'admin/streams/index';
        }
        var vm = {
            title: 'Streams - Evostream Web UI',
            email: req.user ? req.user.email : null,
            streamsActive: "active",
            layout: 'admin/layout',
        }
        res.render(view, vm);

    });

});

/* displaying play stream page */
router.get('/play', restrict, function (req, res, next) {
    winston.log("info", '[webui] streams-route: play ');

    var view = 'admin/streams/play';

    var host = req.get('host');
    var tempEmsIp = host.replace(":" + req.app.settings.port, "");
    var fullUrl = req.protocol + '://' + tempEmsIp + ':8888/';

    var info = new Buffer(req.query.info, 'base64');
    var infoRow = JSON.parse(info);

    winston.log("verbose", '[webui] streams-route: play info - ' + info);
    winston.log("verbose", '[webui] streams-route: play infoRow - ' + JSON.stringify(infoRow));

    var streamFormat = infoRow.streamFormat;

    var vm = {
        title: 'Player - Evostream Web UI'
    };

    var playUrl = null;

    var mediaFolder = '/media/';

    //check if groupnamestreamalias is enabled
    var groupNameAliasEnabled = ipApiProxy.webconfig.hasGroupNameAliases;

    //evo-webroot ip address
    var host = req.get('host');
    var tempEmsIp = host.replace(":" + req.app.settings.port, "");
    var fullUrl = req.protocol + '://' + tempEmsIp + ':' + ipApiProxy.webconfig.port + '/';

    winston.log("info", '[webui] streams-route: check if groupnamealias is enabled - ' + groupNameAliasEnabled);

    //Get info for alias on the configuration
    var webconfig = require(path.join(__dirname, "../core_modules/ems-api-proxy"));

    winston.log("verbose", '[webui] streams-route: check streamFormat - ' + streamFormat);

    if ((streamFormat == 'PULL') || (streamFormat.charAt(0) == 'I')) {

        streamFormat = 'PULL';

        //check if streamalias is enabled
        var parameters = {
            localStreamName: "mylocalstreamname",
            aliasName: "myalias"
        };

        //check addstreamalias
        ems.addStreamAlias(parameters, function (result) {

            if (result.status == 'FAIL') {

                var host = req.get('host');
                vm['emsIp'] = host.replace(":" + req.app.settings.port, "");
                vm['localStreamName'] = infoRow.localStreamName;
                vm['streamName'] = infoRow.localStreamName;
                vm[streamFormat] = true;

                winston.log("verbose", '[webui] streams-route: play stream information - ' + JSON.stringify(vm));
                res.render(view, vm);

            } else {
                //find the stream name
                var parameters = null;
                var foundStreamAlias = false;

                //Execute command for version to check connection to ems
                ems.listStreamAliases(parameters, function (result) {

                    var dataStreamAliases = result.data;

                    if (dataStreamAliases.length > 0) {
                        for (var i = 0; i < dataStreamAliases.length; i++) {

                            if (dataStreamAliases[i].localStreamName == infoRow.localStreamName) {
                                var host = req.get('host');
                                vm['emsIp'] = host.replace(":" + req.app.settings.port, "");
                                vm['streamName'] = dataStreamAliases[i].aliasName;
                                vm['localStreamName'] = infoRow.localStreamName;
                                vm['aliasDescr'] = "streamAlias: " + dataStreamAliases[i].aliasName;
                                foundStreamAlias = true;
                            }
                        }
                    }

                    if (foundStreamAlias == false) {
                        var host = req.get('host');
                        vm['emsIp'] = host.replace(":" + req.app.settings.port, "");
                        vm['localStreamName'] = infoRow.localStreamName;
                        vm['streamName'] = infoRow.localStreamName;
                        vm['aliasDescrError'] = "Error: This stream needs to have an alias. Unable to play stream.";
                    }

                    vm[streamFormat] = true;
                    winston.log("verbose", '[webui] streams-route: play stream information - ' + JSON.stringify(vm));
                    res.render(view, vm);
                });
            }

        });


    } else if ((streamFormat == 'HTML5-VOD')) {

        streamFormat = 'HTML5-VOD';

        //check if streamalias is enabled
        var parameters = {
            localStreamName: "mylocalstreamname",
            aliasName: "myalias"
        };

        var ext = 'mp4';
        if (infoRow.localStreamName) {
            vm['streamName'] = infoRow.localStreamName;
            vm['localStreamName'] = infoRow.localStreamName;
            ext = infoRow.localStreamName.split('.').pop();
        } else {
            vm['streamName'] = infoRow.file;
            vm['localStreamName'] = infoRow.file;
            ext = infoRow.file.split('.').pop();
        }

        //check addstreamalias
        ems.addStreamAlias(parameters, function (result) {

            if (result.status == 'FAIL') {

                var host = req.get('host');
                vm['emsIp'] = host.replace(":" + req.app.settings.port, "");
                vm[streamFormat] = true;

                winston.log("verbose", '[webui] streams-route: play stream information - ' + JSON.stringify(vm));
                res.render(view, vm);

            } else {
                //find the stream name
                var parameters = null;
                var foundStreamAlias = false;

                //Execute command for version to check connection to ems
                ems.listStreamAliases(parameters, function (result) {

                    var dataStreamAliases = result.data;

                    if (dataStreamAliases.length > 0) {
                        for (var i = 0; i < dataStreamAliases.length; i++) {

                            if (dataStreamAliases[i].localStreamName == vm['localStreamName']) {
                                var host = req.get('host');
                                vm['emsIp'] = host.replace(":" + req.app.settings.port, "");
                                vm['aliasDescr'] = "streamAlias: " + dataStreamAliases[i].aliasName;
                                foundStreamAlias = true;
                            }
                        }
                    }

                    if (foundStreamAlias == false) {
                        var host = req.get('host');
                        vm['emsIp'] = host.replace(":" + req.app.settings.port, "");
                        vm['aliasDescrError'] = "Error: This stream needs to have an alias. Unable to play stream.";
                    }

                    vm[streamFormat] = true;
                    winston.log("verbose", '[webui] streams-route: play stream information - ' + JSON.stringify(vm));
                    res.render(view, vm);
                });
            }

        });


    } else if (streamFormat == 'VOD') {

        //check if streamalias is enabled
        var parameters = {
            localStreamName: "mylocalstreamname",
            aliasName: "myalias"
        };

        //check addstreamalias
        ems.addStreamAlias(parameters, function (result) {

            winston.log("info", '[webui] streams-route: check if streamalias is enabled - ' + JSON.stringify(result));

            if (result.status == 'FAIL') {

                var ext = 'mp4';

                var host = req.get('host');
                vm['emsIp'] = host.replace(":" + req.app.settings.port, "");

                if (infoRow.localStreamName) {
                    vm['streamName'] = infoRow.localStreamName;
                    vm['localStreamName'] = infoRow.localStreamName;
                    ext = infoRow.localStreamName.split('.').pop();
                } else {
                    vm['streamName'] = infoRow.file;
                    vm['localStreamName'] = infoRow.file;
                    ext = infoRow.file.split('.').pop();
                }

                vm['emsPlayUrl'] = 'rtmp://' + vm['emsIp'] + '/vod/mp4:' + vm['streamName'];
                vm['playUrl'] = 'rtmp://' + vm['emsIp'] + '/vod/&mp4:' + vm['streamName'];
                vm['playType'] = 'rtmp/' + ext;

                winston.log("verbose", '[webui] streams-route: play stream information - ' + JSON.stringify(vm));

                vm[streamFormat] = true;
                res.render(view, vm);

            } else {

                //find the stream name
                var parameters = null;
                var foundStreamAlias = false;

                ems.listStreamAliases(parameters, function (result) {

                    var dataStreamAliases = result.data;

                    if (dataStreamAliases.length > 0) {
                        for (var i = 0; i < dataStreamAliases.length; i++) {

                            if (dataStreamAliases[i].localStreamName == infoRow.file) {
                                var host = req.get('host');
                                vm['emsIp'] = host.replace(":" + req.app.settings.port, "");
                                vm['streamName'] = dataStreamAliases[i].aliasName;

                                vm['emsPlayUrl'] = 'rtmp://' + vm['emsIp'] + '/vod/' + vm['streamName'];
                                vm['playUrl'] = 'rtmp://' + vm['emsIp'] + '/vod/' + vm['streamName'];
                                vm['playType'] = 'StreamAlias of rtmp/' + ext;

                                vm['aliasDescr'] = "streamAlias: " + dataStreamAliases[i].aliasName;
                                foundStreamAlias = true;
                            }
                        }
                    }

                    if (foundStreamAlias == false) {
                        var host = req.get('host');
                        vm['emsIp'] = host.replace(":" + req.app.settings.port, "");

                        if (infoRow.localStreamName) {
                            vm['streamName'] = infoRow.localStreamName;
                            ext = infoRow.localStreamName.split('.').pop();
                        } else {
                            vm['streamName'] = infoRow.file;
                            ext = infoRow.file.split('.').pop();
                        }

                        vm['emsPlayUrl'] = 'rtmp://' + vm['emsIp'] + '/vod/mp4:' + vm['streamName'];
                        vm['playUrl'] = 'rtmp://' + vm['emsIp'] + '/vod/&mp4:' + vm['streamName'];
                        vm['playType'] = 'rtmp/' + ext;

                        vm['aliasDescrError'] = "Error: This stream needs to have an alias. Unable to play stream.";
                    }

                    vm[streamFormat] = true;
                    winston.log("verbose", '[webui] streams-route: play stream information - ' + JSON.stringify(vm));
                    res.render(view, vm);
                });
            }

        });


    } else if (streamFormat == 'DASH') {

        if (groupNameAliasEnabled) {
            //find the stream name
            var parameters = null;
            var foundGroupNameAlias = false;

            ems.listGroupNameAliases(parameters, function (result) {

                var dataGroupNameAliases = result.data;
                for (var i = 0; i < dataGroupNameAliases.length; i++) {

                    if (dataGroupNameAliases[i].groupName == infoRow.groupName) {
                        vm['playUrl'] = fullUrl + dataGroupNameAliases[i].aliasName;
                        vm['aliasDescr'] = "groupNameAlias: " + dataGroupNameAliases[i].aliasName;
                        foundGroupNameAlias = true;
                    }
                }

                if (foundGroupNameAlias == false) {
                    vm['playUrl'] = fullUrl + infoRow.groupName + '/manifest.mpd';
                    vm['aliasDescrError'] = "Error: This stream needs to have an alias. Unable to play stream.";
                }

                winston.log("verbose", '[webui] streams-route: play stream information - ' + JSON.stringify(vm));
                vm[streamFormat] = true;
                res.render(view, vm);
            });
        } else {
            vm['playUrl'] = fullUrl + infoRow.groupName + '/manifest.mpd';
            vm[streamFormat] = true;
            winston.log("verbose", '[webui] streams-route: play stream information - ' + JSON.stringify(vm));
            res.render(view, vm);
        }


    } else if (streamFormat == 'HLS') {

        if (groupNameAliasEnabled) {
            //find the stream name
            var parameters = null;
            var foundGroupNameAlias = false;

            //Execute command for version to check connection to ems
            ems.listGroupNameAliases(parameters, function (result) {

                var dataGroupNameAliases = result.data;
                for (var i = 0; i < dataGroupNameAliases.length; i++) {

                    if (dataGroupNameAliases[i].groupName == infoRow.groupName) {
                        vm['playUrl'] = fullUrl + dataGroupNameAliases[i].aliasName;
                        vm['aliasDescr'] = "groupNameAlias: " + dataGroupNameAliases[i].aliasName;
                        foundGroupNameAlias = true;
                    }
                }

                if (foundGroupNameAlias == false) {
                    vm['playUrl'] = fullUrl + infoRow.groupName + '/playlist.m3u8';
                    vm['aliasDescrError'] = "Error: This stream needs to have an alias. Unable to play stream.";

                }

                vm[streamFormat] = true;
                winston.log("verbose", '[webui] streams-route: play stream information - ' + JSON.stringify(vm));
                res.render(view, vm);
            });
        } else {
            vm['playUrl'] = fullUrl + infoRow.groupName + '/playlist.m3u8';
            vm[streamFormat] = true;
            winston.log("verbose", '[webui] streams-route: play stream information - ' + JSON.stringify(vm));
            res.render(view, vm);
        }

    } else {
        streamFormat = 'OTHERS'
    }

});

module.exports = router;
