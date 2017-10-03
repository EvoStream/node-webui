var express = require('express');
var router = express.Router();
var path = require('path');
var restrict = require(path.join(__dirname, '../auth/restrict'));
var request = require('request');
var winston = require('winston');
var fs = require('fs');

var recursive = require('recursive-readdir');

//build the api proxy
var ipApiProxy = require(path.join(__dirname, "../core_modules/ems-api-proxy"));
var ems = require(path.join(__dirname, "../core_modules/ems-api-core"))(ipApiProxy.url);

//load social configurations
var socialConfig = require(path.join(__dirname, '../config/social-auth-config'));


router.get('/', restrict, function (req, res, next) {
    winston.log("info", '[webui] ems-routes: index restrict access ');
    redirect('/');

});


router.get('/api/get-ems-dir', restrict, function (req, res, next) {
    winston.log("info", '[webui] ems-routes: get-ems-dir');

    var result = {
        "directory": path.resolve(ipApiProxy.webconfig.webRootFolder)
    }

    res.json(result);

});


router.get('/api/check-connection', restrict, function (req, res, next) {
    winston.log("info", '[webui] ems-routes: check-connection');

    var parameters = null;

    ems.version(parameters, function (result) {

        res.json(result);
    });
});


router.get('/api/get-license-id', restrict, function (req, res, next) {
    winston.log("info", '[webui] ems-routes: get-license-id');

    var parameters = null;

    ems.getLicenseId(parameters, function (result) {
        res.json(result);
    });
});


router.get('/api/get-inbound-outbound-count', restrict, function (req, res, next) {
    winston.log("info", '[webui] ems-routes: get-inbound-outbound-count');

    var streamCountData = [];
    var parameters = null;

    //Execute command for version to check connection to ems
    ems.getStreamsCount(parameters, function (result) {

        if (result.data != null) {
            if (result.data.streamCount > 0) {

                var outboundCount = result.data.streamCount;

                //Execute command for version to check connection to ems
                ems.getInboundStreamsCount(parameters, function (result) {

                    if (result.data != null) {
                        var inboundCount = result.data.inboundStreamsCount;
                        outboundCount = outboundCount - inboundCount;
                        var httpCount = 0;

                        ems.listStreams(parameters, function (result) {

                            var data = result.data;

                            if (data != null) {

                                for (var i in data) {

                                    if (data[i].hasOwnProperty('hlsSettings')) {
                                        httpCount++;
                                    } else if (data[i].hasOwnProperty('hdsSettings')) {
                                        httpCount++;
                                    } else if (data[i].hasOwnProperty('dashSettings')) {
                                        httpCount++;
                                    } else if (data[i].hasOwnProperty('mssSettings')) {
                                        httpCount++;
                                    }
                                }
                            }


                            streamCountData.inbound = inboundCount;
                            streamCountData.outbound = outboundCount;
                            streamCountData.http = httpCount;

                            streamCountData = {
                                'inbound': inboundCount,
                                'outbound': outboundCount,
                                'http': httpCount
                            };

                            res.json(streamCountData);
                        });
                    }
                });
            }
        }
    });
});


router.get('/api/get-list-config', restrict, function (req, res, next) {
    winston.log("info", '[webui] ems-routes: get-list-config');

    var parameters = null;

    ems.listConfig(parameters, function (result) {

        res.json(result);
    });
});


router.get('/api/get-media-folders', restrict, function (req, res, next) {
    winston.log("info", '[webui] ems-routes: get-media-folders');

    var parameters = null;

    ems.listStorage(parameters, function (result) {

        res.json(result);
    });

});


router.post('/api/get-vod-files', restrict, function (req, res, next) {
    winston.log("info", '[webui] ems-routes: get-vod-files');

    var data = req.body;

    var directory = null;

    var filesToPlayList = [];

    if (data.directory != "") {

        directory = data.directory;
        if ((directory[directory.length - 1] == '/') || ((directory[directory.length - 1] == '\\'))) {
            directory = directory.slice(0, -1);
        }

        recursive(directory, function (err, files) {

            if (directory.charAt(0) !== '/') {
                directory = directory + "\\";
            } else {
                directory = directory + "/";
            }

            for (var i in files) {
                var ext = files[i].split('.').pop();

                //Only add files that can be played
                var fileToPlay = ["mp4", "ts", "flv", "m4v", "vod", "lst", "mov"];

                var playFile = fileToPlay.indexOf(ext);

                if (playFile != -1) {

                    var vodFile = files[i].replace(directory, '');
                    filesToPlayList.push(vodFile);
                }
            }

            if (filesToPlayList.length > 0) {
                res.json(filesToPlayList);
            } else {
                res.json("");
            }

        });
    }
});

router.post('/api/delete-vod-files', restrict, function (req, res, next) {
    winston.log("info", '[webui] ems-routes: delete-vod-files');
    
    var data = req.body;

    if (data.filepath != "") {
        fs.unlink(data.filepath, function (err) {

            if (err) res.json(err);
            else res.json(data.filepath);
        });
    }
});


router.get('/api/get-commands-parameters', restrict, function (req, res, next) {
    winston.log("info", '[webui] ems-routes: get-commands-parameters');

    //Get the list of commands on the local help.json
    try {
        var emsApiList = require("../data/help.json");
        res.json(emsApiList);
    }
        //Get the list of commands on the online help.json
    catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {

            var parameters = null;

            ems.version(parameters, function (result) {
                var releaseNumber = result.data.releaseNumber;
                var version = releaseNumber.split('.').join("");
                var acceptedVersion = '170';
                var err = '';

                if (version < acceptedVersion) {
                    err = {
                        'error': "EMS Version not accpeted for API Explorer"
                    };

                    res.json(err);

                } else {
                    var helpUrl = "http://docs.evostream.com/ems_api_definition/assets/" + version + "/help.json";

                    request(helpUrl, function (error, response, body) {
                        if (error) {
                            err = {
                                'error': "Failed to upload help.json"
                            };

                            res.json(err);
                        }

                        if (response.statusCode == 200) {
                            var importedJSON = JSON.parse(body);
                            res.json(importedJSON);
                        }
                    })
                }
            });
        }
    }
});

router.post('/api/execute-command', function (req, res, next) {
    winston.log("info", '[webui] ems-routes: execute-command');

    var data = req.body;
    var parameters = null;

    if (data.parameters != "") {

        var decodedURI = decodeURI(data.parameters).split("&");

        for (var i in decodedURI) {
            decodedURI[i] = decodeURIComponent(decodedURI[i]);
        }

        var tempParams = '{';
        var lastIndex = decodedURI.length - 1;

        for (var i = 0; i < decodedURI.length; i++) {
            tempParams += '"' + decodeURIComponent(decodedURI[i]).replace("=", '":"') + '"';

            if (i != lastIndex) {
                tempParams += ',';
            }
        }

        tempParams += '}';

        tempParams = tempParams.replace(/\+/g, ' ');

        try {
            parameters = JSON.parse(tempParams);
        } catch (e) {
            winston.log("error", "JSON parsing error: " + tempParams);
        }

        for (var i in parameters) {
            parameters[i] = decodeURIComponent(parameters[i]);
        }

        if ((typeof parameters.targetFolder !== 'undefined') && (parameters.targetFolder !== null )) {
            if (parameters.targetFolder.charAt(0) !== '/') {
                var str = parameters.targetFolder;
                parameters.targetFolder = str.replace("file:///", "");
            }
        }

        if ((typeof parameters.pathToFile !== 'undefined') && (parameters.pathToFile !== null )) {
            if (parameters.pathToFile.charAt(0) !== '/') {
                var str = parameters.pathToFile;
                parameters.pathToFile = str.replace("file:///", "");
            }
        }

    }

    ems[data.command](parameters, function (result) {

        res.json(result);
    });

});


router.get('/api/liststreams', restrict, function (req, res, next) {
    winston.log("info", '[webui] ems-routes: liststreams');

    var parameters = null;

    //Execute command for version to check connection to ems
    ems.listStreams(parameters, function (result) {

        res.json(result);
    });
});


router.get('/api/removeconfig', restrict, function (req, res, next) {
    winston.log("info", '[webui] ems-routes: removeconfig');

    var parameters = {
        id: req.query.configid
    };

    //Execute command for version to check connection to ems
    ems.removeConfig(parameters, function (result) {

        res.json(result);
    });
});


router.get('/api/shutdownstream', restrict, function (req, res, next) {
    winston.log("info", '[webui] ems-routes: shutdownstream');

    var parameters = {
        id: req.query.uniqueid
    };

    //Execute command for version to check connection to ems
    ems.removeConfig(parameters, function (result) {

        res.json(result);
    });
});


router.get('/api/getstreaminfo', restrict, function (req, res, next) {
    winston.log("info", '[webui] ems-routes: getstreaminfo');

    var parameters = {
        id: req.query.uniqueid
    };

    //Execute command for version to check connection to ems
    ems.getStreamInfo(parameters, function (result) {

        res.json(result);
    });
});


router.get('/api/getconfiginfo', restrict, function (req, res, next) {
    winston.log("info", '[webui] ems-routes: getconfiginfo');

    var parameters = {
        id: req.query.configid
    };

    //Execute command for version to check connection to ems
    ems.getConfigInfo(parameters, function (result) {

        res.json(result);
    });
});


/*
 * Youtube
 */

router.get('/api/send-youtube', function (req, res, next) {
    winston.log("info", '[webui] ems-routes: send-youtube');

    var data = req.query;
    var parameters = null;

    if (data.command == 'step01') {
        if (req.session.googleUser) {
            parameters = data.parameters + '&token=' + req.session.googleUser.googletoken;

            var youtubeCreate = new Buffer(socialConfig.youtubeCreate, 'base64');
            var createBroadcastUrl = youtubeCreate + parameters;

            request(createBroadcastUrl, function (error, response, body) {

                if (error) {
                    err = {
                        'error': "Failed to upload help.json"
                    };

                    res.json(error);
                }

                if (response.statusCode == 200) {

                    var youtubeData = JSON.parse(body);

                    if (youtubeData.error) {
                        winston.log("error", 'Youtube Error Details: ' + body);

                        var result = {
                            'status': false,
                            'broadcastId': ''
                        };

                        res.json(result);
                    }

                    var parameters = {
                        uri: youtubeData.ingestionAddress,
                        localStreamName: data.localStreamName,
                        targetStreamName: youtubeData.streamName

                    };

                    //Execute command for pushStream to send stream to youtube
                    ems.pushStream(parameters, function (result) {

                        if (result.status == 'SUCCESS') {

                            //Transition Youtube Stream to Testing
                            setTimeout(function () {

                                var parameters = 'token=' + req.session.googleUser.googletoken + '&broadcastId=' + youtubeData.broadcastId + '&statusYtStream=testing';

                                var youtubeTransition = new Buffer(socialConfig.youtubeTransition, 'base64');
                                var transitionToTestUrl = youtubeTransition + parameters;

                                request(transitionToTestUrl, function (error, response, body) {

                                    if (error) {
                                        var result = {
                                            'status': false,
                                            'broadcastId': ''
                                        };

                                        res.json(error);
                                    }

                                    if (response.statusCode == 200) {

                                        var youtubeData = JSON.parse(body);

                                        if (youtubeData.error) {
                                            winston.log("error", 'Youtube Error Details: ' + body);

                                            var result = {
                                                'status': false,
                                                'broadcastId': ''
                                            };

                                            res.json(result);
                                        }

                                        if (youtubeData.broadcastId) {

                                            var result = {
                                                'status': true,
                                                'broadcastId': youtubeData.broadcastId
                                            };

                                            res.json(result);

                                        }
                                    }
                                });
                            }, 10000);


                        }


                    });


                }
            });
        }
    } else if (data.command == 'step02') {
        //Transition Youtube Stream to Live
        if (req.session.googleUser && typeof data.broadcastId !== 'undefined' && data.broadcastId) {
            setTimeout(function () {

                var parametersToLive = 'token=' + req.session.googleUser.googletoken + '&broadcastId=' + data.broadcastId + '&statusYtStream=live';

                var youtubeTransition = new Buffer(socialConfig.youtubeTransition, 'base64');
                var transitionToLiveUrl = youtubeTransition + parametersToLive;

                request(transitionToLiveUrl, function (error, response, body) {

                    if (error) {
                        var result = {
                            'status': false,
                            'broadcastId': ''
                        };

                        res.json(error);
                    }

                    if (response.statusCode == 200) {

                        var youtubeData = JSON.parse(body);

                        if (youtubeData.error) {
                            winston.log("error", 'Youtube Error Details: ' + body);

                            var result = {
                                'status': false,
                                'broadcastId': ''
                            };

                            res.json(result);
                        }

                        if (youtubeData.broadcastId) {

                            var result = {
                                'status': true,
                                'url': 'https://www.youtube.com/live_event_analytics?v=' + youtubeData.broadcastId
                            };
                            res.json(result);
                        }
                    }
                });
            }, 30000);
        }

    }

});


/*
 * Facebook
 */
router.get('/api/get-fb-edge', restrict, function (req, res, next) {
    winston.log("info", '[webui] ems-routes: get-fb-edge');

    var data = req.query;
    var parameters = null;


    if (req.session.fbUser) {
        parameters = data.parameters + '&token=' + req.session.fbUser.fbtoken;

        var fbEdge = new Buffer(socialConfig.fbEdge, 'base64');
        var getInfoUrl = fbEdge + parameters;

        request(getInfoUrl, function (error, response, body) {

            if (response.statusCode == 200) {
                res.json(body);
            }

            winston.log("info", '[webui] ems-routes: facebook encountered an error - '+body);

        });

    }

});


router.get('/api/send-facebook', function (req, res, next) {
    winston.log("info", '[webui] ems-routes: send-facebook');

    var data = req.query;
    var parameters = null;

    if (req.session.fbUser) {
        parameters = data.parameters + '&token=' + req.session.fbUser.fbtoken;

        var fbVideo = new Buffer(socialConfig.fbVideo, 'base64');
        var createFbVideoUrl = fbVideo + parameters;

        request(createFbVideoUrl, function (error, response, body) {

            if (error) {
                err = {
                    'error': "Failed to upload help.json"
                };

                res.json(error);
            }

            if (response.statusCode == 200) {

                var facebookData = JSON.parse(body);

                if (facebookData.error) {
                    winston.log("info", '[webui] ems-routes: facebook encountered an error - '+body);

                    var result = {
                        'status': false
                    };

                    res.json(result);
                } else {
                    var facebookStreamUrl = facebookData.stream_url;
                    var facebookTargetProtocolUrl = 'rtmp://rtmp-api.facebook.com:80/rtmp/';

                    if (data.protocol == 'rtmps') {
                        facebookStreamUrl = facebookData.secure_stream_url;
                        facebookTargetProtocolUrl = 'rtmps://rtmp-api.facebook.com:443/rtmp/';
                    }

                    var facebookTarget = facebookStreamUrl.replace(facebookTargetProtocolUrl, "");

                    winston.log("verbose", 'facebookTargetProtocolUrl ' + facebookTargetProtocolUrl);
                    winston.log("verbose", 'facebookTarget ' + facebookTarget);

                    var parameters = {
                        uri: facebookTargetProtocolUrl,
                        localStreamName: data.localStreamName,
                        targetStreamName: facebookTarget
                    };

                    //Execute command for pushStream to send stream to youtube
                    ems.pushStream(parameters, function (result) {
                        winston.log("verbose", "pushStream result" + JSON.stringify(result));
                        // res.json(result);

                        if (result.status == 'SUCCESS') {
                            var result = {
                                'status': true
                            };
                            res.json(result);
                        }
                    });
                }
            }
        });
    }
});


module.exports = router;