/**
 * listConfig Model
 */
var path = require('path');
var winston = require('winston');

//Build the api proxy
var ipApiProxy = require(path.join(__dirname, "../core_modules/ems-api-proxy"));
var ems = require(path.join(__dirname, "../core_modules/ems-api-core"))(ipApiProxy.url);

//Initialize ListStream Map
var listConfigMap = {
    dash: {
        rowCollection: []
    },
    hds: {
        rowCollection: []
    },
    hls: {
        rowCollection: []
    },
    metalistener: {
        rowCollection: []
    },
    mss: {
        rowCollection: []
    },
    process: {
        rowCollection: []
    },
    pull: {
        rowCollection: []
    },
    pushEms: {
        rowCollection: []
    },
    record: {
        rowCollection: []
    },
    webrtc: {
        rowCollection: []
    }
};

exports.update = function (data, next) {
    winston.log("info", '[webui] list-config: updating data: ' + JSON.stringify(data));

    if (data != null) {

        //validate if config id is already added to the list
        var configTypeList = ["dash", "hds", "hls", "metalistener", "mss", "process", "pull", "pushEms", "record", "webrtc"];

        for (var y = 0; y < configTypeList.length; y++) {
            var configType = configTypeList[y];

            for (var i = 0; i < listConfigMap[configType].rowCollection.length; i++) {

                if ((listConfigMap[configType].rowCollection[i].configId == data.payload.configId)) {

                    winston.log("info", '[webui] list-config: data alredy exist - '+JSON.stringify(listConfigMap));
                    next(listConfigMap);

                }
            }
        }


        if (typeof data.dash.configId == 'number') {

            for (var i = 0; i < listConfigMap.dash.rowCollection.length; i++) {

                if ((listConfigMap.dash.rowCollection[i].configId == data.dash.configId)) {

                    winston.log("info", '[webui] list-config: data alredy exist - '+JSON.stringify(listConfigMap));
                    next(listConfigMap);

                }
            }

            listConfigMap.dash.rowCollection.push(data.dash);
            next(listConfigMap);

        }
        else if (typeof data.hds.configId == 'number') {
            for (var i = 0; i < listConfigMap.hds.rowCollection.length; i++) {

                if ((listConfigMap.hds.rowCollection[i].configId == data.hds.configId)) {

                    winston.log("info", '[webui] list-config: data alredy exist - '+JSON.stringify(listConfigMap));
                    next(listConfigMap);

                }
            }

            listConfigMap.hds.rowCollection.push(data.hds);
            next(listConfigMap);
        }
        else if (typeof data.hls.configId == 'number') {
            for (var i = 0; i < listConfigMap.hls.rowCollection.length; i++) {

                if ((listConfigMap.hls.rowCollection[i].configId == data.hls.configId)) {

                    winston.log("info", '[webui] list-config: data alredy exist - '+JSON.stringify(listConfigMap));
                    next(listConfigMap);

                }
            }
            listConfigMap.hls.rowCollection.push(data.hls);
            next(listConfigMap);

        }
        else if (typeof data.metalistener.configId == 'number') {
            for (var i = 0; i < listConfigMap.metalistener.rowCollection.length; i++) {

                if ((listConfigMap.metalistener.rowCollection[i].configId == data.metalistener.configId)) {

                    winston.log("info", '[webui] list-config: data alredy exist - '+JSON.stringify(listConfigMap));
                    next(listConfigMap);

                }
            }
            listConfigMap.metalistener.rowCollection.push(data.metalistener);
            next(listConfigMap);

        }
        else if (typeof data.mss.configId == 'number') {
            for (var i = 0; i < listConfigMap.mss.rowCollection.length; i++) {

                if ((listConfigMap.mss.rowCollection[i].configId == data.mss.configId)) {

                    winston.log("info", '[webui] list-config: data alredy exist - '+JSON.stringify(listConfigMap));
                    next(listConfigMap);

                }
            }
            listConfigMap.mss.rowCollection.push(data.mss);
            next(listConfigMap);

        }
        else if (typeof data.process.configId == 'number') {
            for (var i = 0; i < listConfigMap.process.rowCollection.length; i++) {

                if ((listConfigMap.process.rowCollection[i].configId == data.process.configId)) {

                    winston.log("info", '[webui] list-config: data alredy exist - '+JSON.stringify(listConfigMap));
                    next(listConfigMap);

                }
            }
            listConfigMap.process.rowCollection.push(data.process);
            next(listConfigMap);

        }
        else if (typeof data.pull.configId == 'number') {
            for (var i = 0; i < listConfigMap.pull.rowCollection.length; i++) {

                if ((listConfigMap.pull.rowCollection[i].configId == data.pull.configId)) {

                    winston.log("info", '[webui] list-config: data alredy exist - '+JSON.stringify(listConfigMap));
                    next(listConfigMap);

                }
            }
            listConfigMap.pull.rowCollection.push(data.pull);
            next(listConfigMap);

        }

        else if (typeof data.record.configId == 'number') {
            for (var i = 0; i < listConfigMap.record.rowCollection.length; i++) {

                if ((listConfigMap.record.rowCollection[i].configId == data.record.configId)) {

                    winston.log("info", '[webui] list-config: data alredy exist - '+JSON.stringify(listConfigMap));
                    next(listConfigMap);

                }
            }
            listConfigMap.record.rowCollection.push(data.record);
            next(listConfigMap);

        }
        else if (typeof data.webrtc.configId == 'number') {
            for (var i = 0; i < listConfigMap.webrtc.rowCollection.length; i++) {

                if ((listConfigMap.webrtc.rowCollection[i].configId == data.webrtc.configId)) {

                    winston.log("info", '[webui] list-config: data alredy exist - '+JSON.stringify(listConfigMap));
                    next(listConfigMap);

                }
            }
            listConfigMap.webrtc.rowCollection.push(data.webrtc);
            next(listConfigMap);

        }
        else if (typeof data.pushEms.configId == 'number') {
            for (var i = 0; i < listConfigMap.pushEms.rowCollection.length; i++) {

                if ((listConfigMap.pushEms.rowCollection[i].configId == data.pushEms.configId)) {

                    winston.log("info", '[webui] list-config: data alredy exist - '+JSON.stringify(listConfigMap));
                    next(listConfigMap);

                }
            }
            listConfigMap.pushEms.rowCollection.push(data.pushEms);
            next(listConfigMap);

        }

    }
    else {

        listConfigMap.dash = {};
        listConfigMap.hls = {};
        listConfigMap.metalistener = {};
        listConfigMap.mss = {};
        listConfigMap.hds = {};
        listConfigMap.process = {};
        listConfigMap.pull = {};
        listConfigMap.pushEms = {};
        listConfigMap.record = {};
        listConfigMap.webrtc = {};

        listConfigMap.dash['rowCollection'] = [];
        listConfigMap.hds['rowCollection'] = [];
        listConfigMap.hls['rowCollection'] = [];
        listConfigMap.metalistener['rowCollection'] = [];
        listConfigMap.mss['rowCollection'] = [];
        listConfigMap.process['rowCollection'] = [];
        listConfigMap.pull['rowCollection'] = [];
        listConfigMap.pushEms['rowCollection'] = [];
        listConfigMap.record['rowCollection'] = [];
        listConfigMap.webrtc['rowCollection'] = [];

        var dashRowCollection = [];
        var hdsRowCollection = [];
        var hlsRowCollection = [];
        var metalistenerRowCollection = [];
        var mssRowCollection = [];
        var processRowCollection = [];
        var pullRowCollection = [];
        var pushEmsRowCollection = [];
        var recordRowCollection = [];
        var webrtcRowCollection = [];

        //get from liststreams from http
        var parameters = null;
        ems.listConfig(parameters, function (result) {

            var listConfigData = result.data;

            if (listConfigData != null) {
                for (var i in listConfigData) {

                    var settingsData = listConfigData[i];

                    for (var y in settingsData) {

                        var localStreamName = "";
                        if (settingsData[y].localStreamName !== 'undefined') {
                            if (settingsData[y].localStreamName != null) {
                                localStreamName = settingsData[y].localStreamName;
                            }
                        }

                        //if for each config type
                        if (i == 'dash') {
                            dashRowCollection.push({
                                "configId": settingsData[y].configId,
                                "localStreamName": localStreamName,
                                "groupName": settingsData[y].groupName
                            });
                        } else if (i == 'hds') {
                            hdsRowCollection.push({
                                "configId": settingsData[y].configId,
                                "localStreamName": localStreamName,
                                "groupName": settingsData[y].groupName
                            });
                        } else if (i == 'hls') {
                            hlsRowCollection.push({
                                "configId": settingsData[y].configId,
                                "localStreamName": localStreamName,
                                "groupName": settingsData[y].groupName
                            });
                        } else if (i == 'metalistener') {

                            metalistenerRowCollection.push({
                                "configId": settingsData[y].configId,
                                "localStreamName": localStreamName,
                                "protocol": settingsData[y].protocol,
                                "port": settingsData[y].port
                            });
                        } else if (i == 'mss') {
                            mssRowCollection.push({
                                "configId": settingsData[y].configId,
                                "localStreamName": localStreamName,
                                "groupName": settingsData[y].groupName
                            });
                        } else if (i == 'process') {
                            processRowCollection.push({
                                "configId": settingsData[y].configId,
                                "fullBinaryPath": settingsData[y].fullBinaryPath,
                                "groupName": settingsData[y].groupName
                            });
                        } else if (i == 'pull') {
                            var sourceURI = "";

                            if (settingsData[y].uri !== 'undefined') {
                                sourceURI = settingsData[y].uri;
                            }

                            pullRowCollection.push({
                                "configId": settingsData[y].configId,
                                "localStreamName": localStreamName,
                                "sourceURI": sourceURI
                            });
                        } else if (i == 'push') {
                            pushEmsRowCollection.push({
                                "configId": settingsData[y].configId,
                                "localStreamName": localStreamName,
                                "targetUri": settingsData[y].targetUri,
                                "targetStreamName": settingsData[y].targetStreamName
                            });
                        } else if (i == 'record') {
                            recordRowCollection.push({
                                "configId": settingsData[y].configId,
                                "localStreamName": localStreamName,
                                "pathToFile": settingsData[y].pathToFile,
                                "type": settingsData[y].type
                            });
                        } else if (i == 'webrtc') {
                            webrtcRowCollection.push({
                                "configId": settingsData[y].configId,
                                "ersip": settingsData[y].ersip,
                                "ersport": settingsData[y].ersport,
                                "roomid": settingsData[y].roomid
                            });
                        }
                    }
                }

            }

            listConfigMap = {
                dash: {
                    rowCollection: dashRowCollection
                },
                hds: {
                    rowCollection: hdsRowCollection
                },
                hls: {
                    rowCollection: hlsRowCollection
                },
                metalistener: {
                    rowCollection: metalistenerRowCollection
                },
                mss: {
                    rowCollection: mssRowCollection
                },
                process: {
                    rowCollection: processRowCollection
                },
                pull: {
                    rowCollection: pullRowCollection
                },
                pushEms: {
                    rowCollection: pushEmsRowCollection
                },
                record: {
                    rowCollection: recordRowCollection
                },
                webrtc: {
                    rowCollection: webrtcRowCollection
                }
            };

            winston.log("info", '[webui] list-config:  data added - ' + JSON.stringify(listConfigMap));
            next(listConfigMap);

        });

    }


};

exports.delete = function (configType, configId, next) {

    winston.log("info", '[webui] list-config: deleting data with configId - ' + configId);

    //delete only if configid exists
    if (configId != 0) {

        if (configType == 'push') {
            configType = 'pushEms';
        }

        for (var i = 0; i < listConfigMap[configType].rowCollection.length; i++) {
            if ((listConfigMap[configType].rowCollection[i].configId == configId)) {

                //delete the entry
                listConfigMap[configType].rowCollection.splice(i, 1);

                winston.log("info", '[webui] list-config: data updated after deletion - ' + JSON.stringify(listConfigMap));
                next(listConfigMap);

            }
        }

    }

    winston.log("info", '[webui] list-config: data refreshing after deletion - ' + JSON.stringify(listConfigMap));
    next(listConfigMap);

};
