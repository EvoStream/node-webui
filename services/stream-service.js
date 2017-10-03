/***
 *
 * EvoStream Web Services
 * EvoStream, Inc.
 * (c) 2017 by EvoStream, Inc. (salesupport@evostream.com)
 * Released under the MIT License
 *
 ***/

/**
 * stream service
 */

var winston = require('winston');
var path = require('path');

//load the liststream and listconfig models
var liststreamModel = require(path.join(__dirname, '../models/list-streams'));
var listconfigModel = require(path.join(__dirname, '../models/list-config'));

var ipApiProxy = require(path.join(__dirname, "../core_modules/ems-api-proxy"));
var ems = require(path.join(__dirname, "../core_modules/ems-api-core"))(ipApiProxy.url);


exports.updateListStreamsTable = function (data, next) {
    winston.log("info", '[webui] stream-service: updateListStreamsTable ');

    if (data !== null) {

        if (data.type !== 'undefined') {

            var eventType = data.type;
            var payload = data.payload;

            data.inboundRowCollection = [];
            data.outboundRowCollection = [];
            data.httpRowCollection = [];

            winston.log("verbose", '[webui] stream-service: updateListStreamsTable eventType ' + eventType);

            if (eventType == 'inStreamCreated') {

                var sourceURI = '';
                var streamFormat = "Inbound";

                if (payload.hasOwnProperty('pullSettings')) {
                    sourceURI = payload.pullSettings.uri;
                    streamFormat = 'PULL';
                } else if (payload.type = 'IFR') {
                    streamFormat = payload.type;
                    payload.name = payload.name.split('\\').pop().split('/').pop();
                } else {
                    streamFormat = payload.type;
                }

                data.inboundRowCollection = {
                    "streamId": payload.uniqueId,
                    "streamFormat": streamFormat,
                    "localStreamName": payload.name,
                    "sourceURI": sourceURI,
                    "audioCodec": payload.audio.codec,
                    "videoCodec": payload.video.codec
                };

                liststreamModel.update(data, function (response) {
                    next(response);
                });
            }
            else if (eventType == 'inStreamClosed') {

                //call the delete
                liststreamModel.delete("inbound", payload.uniqueId, function (response) {
                    next(response);
                });

            }
            else if (eventType == 'outStreamCreated') {

                if (payload.type = "ONFMP4") {
                    streamFormat = 'Playback';
                }

                var streamFormat = "Outbound";
                var groupName = '';

                if (payload.hasOwnProperty('hlsSettings')) {
                    streamFormat = 'HLS';
                    groupName = payload.hlsSettings.groupName;

                } else if (payload.hasOwnProperty('dashSettings')) {
                    streamFormat = 'DASH';
                    groupName = payload.dashSettings.groupName;

                } else if (payload.hasOwnProperty('hdsSettings')) {
                    streamFormat = 'HDS';
                    groupName = payload.hdsSettings.groupName;

                } else if (payload.hasOwnProperty('mssSettings')) {
                    streamFormat = 'MSS';
                    groupName = payload.mssSettings.groupName;

                } else {
                    if (payload.hasOwnProperty('pushSettings')) {
                        streamFormat = 'PUSH';
                    }
                }

                if (streamFormat == 'Outbound' || streamFormat == 'PUSH') {

                    data.outboundRowCollection = {
                        "streamId": payload.uniqueId,
                        "streamFormat": streamFormat,
                        "sourceStreamName": payload.name,
                        "farIp": payload.farIp,
                        "audioCodec": payload.audio.codec,
                        "videoCodec": payload.video.codec
                    };

                } else {

                    data.httpRowCollection = {
                        "streamId": payload.uniqueId,
                        "streamFormat": streamFormat,
                        "sourceStreamName": payload.name,
                        "groupName": groupName,
                        "audioCodec": payload.audio.codec,
                        "videoCodec": payload.video.codec
                    };

                }

                //get the liststream data
                liststreamModel.update(data, function (response) {
                    next(response);

                });

            }
            else if (eventType == 'outStreamClosed') {
                if ((typeof (payload.hlsSettings) != "undefined") || (typeof (payload.hdsSettings) != "undefined") || (typeof (payload.msssSettings) != "undefined") || (typeof (payload.dashSettings) != "undefined")) {

                    //call the delete
                    liststreamModel.delete("http", payload.uniqueId, function (response) {
                        next(response);
                    });
                } else {
                    //call the delete
                    liststreamModel.delete("outbound", payload.uniqueId, function (response) {
                        next(response);
                    });
                }

            }
            else {

                var data = null;

                //get the liststream data
                liststreamModel.update(data, function (response) {
                    next(response);

                });
            }

        }
    } else {
        //get the liststream data
        liststreamModel.update(data, function (response) {
            next(response);

        });
    }

};


exports.updateListConfigTable = function (data, next) {
    winston.log("info", '[webui] stream-service: updateListConfigTable ');

    winston.log("info", '[webui] stream-service: updateListConfigTable data '+JSON.stringify(data));

    if (data !== null) {

        if (data.type !== 'undefined') {
            var eventType = data.type;
            var payload = data.payload;

            data.dash = [];
            data.hds = [];
            data.hls = [];
            data.metalistener = [];
            data.mss = [];
            data.process = [];
            data.pull = [];
            data.push = [];
            data.record = [];
            data.webrtc = [];

            winston.log("verbose", '[webui] stream-service: updateListConfigTable eventType ' + eventType);

            if (eventType == 'inStreamCreated') {

                if (payload.hasOwnProperty('pullSettings')) {

                    data.pull = {
                        "configId": payload.pullSettings.configId,
                        "localStreamName": payload.pullSettings.localStreamName,
                        "sourceURI": payload.pullSettings.uri
                    };

                    //update the listconfig data
                    listconfigModel.update(data, function (response) {
                        next(response);
                    });
                }

            }
            else if (eventType == 'inStreamClosed') {

                if (payload.hasOwnProperty('pullSettings')) {

                    //call the delete
                    // listconfigModel.delete("pull", payload.pullSettings.configId, function (response) {
                    //     next(response);
                    //
                    // });

                    var data = null;

                    //get the listconfig data
                    listconfigModel.update(data, function (response) {
                        next(response);
                    });
                }
            }
            else if (eventType == 'outStreamCreated') {

                if (payload.hasOwnProperty('pushSettings')) {

                    data.pushEms = {
                        "configId": payload.pushSettings.configId,
                        "localStreamName": payload.pushSettings.localStreamName,
                        "sourceURI": payload.pushSettings.uri
                    };
                }
                else if (payload.hasOwnProperty('recordSettings')) {

                    data.record = {
                        "configId": payload.recordSettings.configId,
                        "localStreamName": payload.recordSettings.localStreamName,
                        "pathToFile": payload.recordSettings.pathToFile,
                        "type": payload.recordSettings.type
                    };
                }
                else if (payload.hasOwnProperty('dashSettings')) {

                    data.dash = {
                        "configId": payload.dashSettings.configId,
                        "localStreamName": payload.dashSettings.localStreamName,
                        "groupName": payload.dashSettings.groupName
                    };
                }
                else if (payload.hasOwnProperty('hdsSettings')) {

                    data.hds = {
                        "configId": payload.hdsSettings.configId,
                        "localStreamName": payload.hdsSettings.localStreamName,
                        "groupName": payload.hdsSettings.groupName
                    };
                }
                else if (payload.hasOwnProperty('hlsSettings')) {

                    data.hls = {
                        "configId": payload.hlsSettings.configId,
                        "localStreamName": payload.hlsSettings.localStreamName,
                        "groupName": payload.hlsSettings.groupName
                    };
                }
                else if (payload.hasOwnProperty('mssSettings')) {

                    data.mss = {
                        "configId": payload.mssSettings.configId,
                        "localStreamName": payload.mssSettings.localStreamName,
                        "groupName": payload.mssSettings.groupName
                    };
                }

                listconfigModel.update(data, function (response) {
                    next(response);

                });
            }
            else if (eventType == 'outStreamClosed') {

                if (payload.hasOwnProperty('pushSettings')) {

                    listconfigModel.delete("push", payload.pushSettings.configId, function (response) {
                        next(response);

                    });
                }
                else if (payload.hasOwnProperty('recordSettings')) {

                    listconfigModel.delete("record", payload.recordSettings.configId, function (response) {
                        next(response);
                    });
                }
                else if (payload.hasOwnProperty('dashSettings')) {

                    listconfigModel.delete("dash", payload.dashSettings.configId, function (response) {
                        next(response);
                    });
                }
                else if (payload.hasOwnProperty('hdsSettings')) {

                    listconfigModel.delete("hds", payload.hdsSettings.configId, function (response) {
                        next(response);
                    });
                }
                else if (payload.hasOwnProperty('hlsSettings')) {

                    listconfigModel.delete("hls", payload.hlsSettings.configId, function (response) {
                        next(response);
                    });
                }
                else if (payload.hasOwnProperty('mssSettings')) {

                    listconfigModel.delete("mss", payload.mssSettings.configId, function (response) {
                        next(response);
                    });
                }

            }
            else if (eventType == 'processStarted') {

                data.process = {
                    "configId": payload.configId,
                    "fullBinaryPath": payload.fullBinaryPath,
                    "groupName": payload.groupName
                };

                //get the liststream data
                listconfigModel.update(data, function (response) {
                    next(response);
                });

            }
            else if (eventType == 'processStopped') {

                listconfigModel.delete("process", payload.configId, function (response) {
                    next(response);
                });
            }
            else if (eventType == 'webRtcServiceStarted') {

                data.webrtc = {
                    "configId": payload.configId,
                    "ersip": payload.ersIp,
                    "ersport": payload.ersPort,
                    "roomid": payload.roomId

                };

                listconfigModel.update(data, function (response) {
                    next(response);
                });

            }
            else if (eventType == 'webRtcServiceStopped') {

                listconfigModel.delete("webrtc", payload.configId, function (response) {
                    next(response);
                });
            }
        }
    }
    else {

        var data = null;

        //get the listconfig data
        listconfigModel.update(data, function (response) {
            next(response);
        });
    }

};
