/**
 * listStreams Model
 */

var path = require('path');
var winston = require('winston');

//Build the api proxy
var ipApiProxy = require(path.join(__dirname, "../core_modules/ems-api-proxy"));
var ems = require(path.join(__dirname, "../core_modules/ems-api-core"))(ipApiProxy.url);

//Initialize ListStream Map
var listStreamsMap = {
    inbound: {
        rowCollection: []
    },
    outbound: {
        rowCollection: []
    },
    http: {
        rowCollection: []
    }
};


exports.update = function (data, next) {

    winston.log("info", '[webui] list-streams: updating data ');

    if (data != null) {
        if (data.payload.uniqueId > 0) {

            if (typeof data.inboundRowCollection.streamId == 'number') {
                listStreamsMap.inbound.rowCollection.push(data.inboundRowCollection);

            } else if (typeof data.outboundRowCollection.streamId == 'number') {
                listStreamsMap.outbound.rowCollection.push(data.outboundRowCollection);

            } else if (typeof data.httpRowCollection.streamId == 'number') {
                listStreamsMap.http.rowCollection.push(data.httpRowCollection);

            }

            winston.log("info", '[webui] list-streams: data added - '+JSON.stringify(listStreamsMap));
            next(listStreamsMap);

        }
    }
    else {
        listStreamsMap['inbound'] = {};
        listStreamsMap['outbound'] = {};
        listStreamsMap['http'] = {};

        listStreamsMap['inbound']['rowCollection'] = [];
        listStreamsMap['outbound']['rowCollection'] = [];
        listStreamsMap['http']['rowCollection'] = [];

        var inboundRowCollection = [];
        var outboundRowCollection = [];
        var httpRowCollection = [];

        //get liststreams from http
        var parameters = null;
        ems.listStreams(parameters, function (result) {

            var liststreamData = result.data;

            if (liststreamData != null) {

                for (var i in liststreamData) {

                    if (liststreamData[i].type.charAt(0) == 'I') {

                        var sourceURI = '';
                        var streamFormat = "Inbound";

                        if (liststreamData[i].hasOwnProperty('pullSettings')) {
                            sourceURI = liststreamData[i].pullSettings.uri;
                            streamFormat = 'PULL';
                        } else if (liststreamData[i].type = 'IFR') {
                            streamFormat = liststreamData[i].type;
                            liststreamData[i].name = liststreamData[i].name.split('\\').pop().split('/').pop();
                        } else{
                            streamFormat = liststreamData[i].type;
                        }

                        //set the type as inbound
                        inboundRowCollection.push({
                            "streamId": liststreamData[i].uniqueId,
                            "streamFormat": streamFormat,
                            "localStreamName": liststreamData[i].name,
                            "sourceURI": sourceURI,
                            "audioCodec": liststreamData[i].audio.codec,
                            "videoCodec": liststreamData[i].video.codec
                        });


                    } else if (liststreamData[i].type.charAt(0) == 'O') {

                        var streamFormat = "Outbound";
                        var groupName = '';

                        if (liststreamData[i].hasOwnProperty('hlsSettings')) {
                            streamFormat = 'HLS';
                            groupName = liststreamData[i].hlsSettings.groupName;

                        } else if (liststreamData[i].hasOwnProperty('dashSettings')) {
                            streamFormat = 'DASH';
                            groupName = liststreamData[i].dashSettings.groupName;

                        } else if (liststreamData[i].hasOwnProperty('hdsSettings')) {
                            streamFormat = 'HDS';
                            groupName = liststreamData[i].hdsSettings.groupName;

                        } else if (liststreamData[i].hasOwnProperty('mssSettings')) {
                            streamFormat = 'MSS';
                            groupName = liststreamData[i].mssSettings.groupName;

                        } else {
                            if (liststreamData[i].hasOwnProperty('pushSettings')) {
                                streamFormat = 'PUSH';
                            }
                        }

                        if (streamFormat == 'Outbound' || streamFormat == 'PUSH') {

                            outboundRowCollection.push({
                                "streamId": liststreamData[i].uniqueId,
                                "streamFormat": streamFormat,
                                "sourceStreamName": liststreamData[i].name,
                                "farIp": liststreamData[i].farIp,
                                "audioCodec": liststreamData[i].audio.codec,
                                "videoCodec": liststreamData[i].video.codec
                            });

                        } else {

                            httpRowCollection.push({
                                "streamId": liststreamData[i].uniqueId,
                                "streamFormat": streamFormat,
                                "sourceStreamName": liststreamData[i].name,
                                "groupName": groupName,
                                "audioCodec": liststreamData[i].audio.codec,
                                "videoCodec": liststreamData[i].video.codec
                            });

                        }
                    }

                }

            }

            winston.log("verbose", "[webui] list-streams: inboundRowCollection " + JSON.stringify(inboundRowCollection));
            winston.log("verbose", "[webui] list-streams: outboundRowCollection " + JSON.stringify(outboundRowCollection));
            winston.log("verbose", "[webui] list-streams: httpRowCollection " + JSON.stringify(httpRowCollection));

            listStreamsMap = {
                inbound: {
                    rowCollection: inboundRowCollection
                },
                outbound: {
                    rowCollection: outboundRowCollection
                },
                http: {
                    rowCollection: httpRowCollection
                }
            };

            winston.log("info", '[webui] list-streams: data added - '+JSON.stringify(listStreamsMap));
            next(listStreamsMap);

        });
    }

};

exports.delete = function (streamType, data, next) {

    var uniqueId = data;

    winston.log("info", '[webui] list-streams: deleting data with uniqueId - '+uniqueId);

    if (uniqueId == 0) {

        var dataRefresh = null;

        module.exports.update(dataRefresh, function (response) {

            winston.log("info", '[webui] list-streams: data updated after deletion - '+JSON.stringify(response));
            next(response);

        });

    } else {
        //find the camera stream and delete the entry
        for (var i = 0; i < listStreamsMap[streamType].rowCollection.length; i++) {
            if ((listStreamsMap[streamType].rowCollection[i].streamId == uniqueId)) {

                //delete the entry
                listStreamsMap[streamType].rowCollection.splice(i, 1);

                winston.log("info", '[webui] list-streams: data updated after deletion - '+JSON.stringify(listStreamsMap));
                next(listStreamsMap);

            }
        }
    }

    next(listStreamsMap);

};