var express = require('express');
var router = express.Router();
var path = require('path');
var restrict = require(path.join(__dirname, '../auth/restrict'));
var request = require('request');
var winston = require('winston');

//build the api proxy
var ipApiProxy = null;

var ems = require(path.join(__dirname, "../core_modules/ems-api-core"))(ipApiProxy);
var fs = require('fs');

//default media folder
var dirConfig = require(path.join(__dirname, '../config/dir-config'));
var socialConfig = require(path.join(__dirname, '../config/social-auth-config'));

router.get('/', restrict, function (req, res, next) {
    //Redirect to index
    // res.redirect('login');

    console.log('ems route working');
});


router.get('/api/check-connection', restrict, function (req, res, next) {
    var parameters = null;

    //Execute command for version to check connection to ems
    ems.version(parameters, function (result) {
        // console.log("version result" + JSON.stringify(result));

        res.json(result);
    });
});

/*
 * Dashboard Page
 */

router.get('/api/get-license-id', restrict, function (req, res, next) {
    var parameters = null;

    //Execute command for version to check connection to ems
    ems.getLicenseId(parameters, function (result) {
        // console.log("version result" + JSON.stringify(result));

        res.json(result);
    });
});

router.get('/api/get-inbound-outbound-count', restrict, function (req, res, next) {

    var streamCountData = [];
    var parameters = null;

    //Execute command for version to check connection to ems
    ems.getStreamsCount(parameters, function (result) {
        console.log("getStreamsCount result" + JSON.stringify(result));

        // var data = result;

        if(result.data != null){
            if (result.data.streamCount > 0) {

                var outboundCount = result.data.streamCount;

                //Execute command for version to check connection to ems
                ems.getInboundStreamsCount(parameters, function (result) {
                    console.log("getInboundStreamsCount result" + JSON.stringify(result));

                    console.log('(result.data != null ) '+ (result.data != null ));
                    // console.log('result.data.length > 0 '+result.data.length > 0 );

                    if(result.data != null ) {
                        var inboundCount = result.data.inboundStreamsCount;
                        outboundCount = outboundCount - inboundCount;
                        var httpCount = 0;

                        ems.listStreams(parameters, function (result) {
                            console.log("listStreams result" + JSON.stringify(result));

                            // res.json(result);

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

                            console.log('streamCountData.http  ' + streamCountData.http);
                            console.log('streamCountData.inbound  ' + streamCountData.inbound);
                            console.log('streamCountData.outbound  ' + streamCountData.outbound);
                            console.log('streamCountData ' + JSON.stringify(streamCountData));

                            res.json(streamCountData);
                        });
                    }


                });
            }
        }


    });
});


/*
 * stream: List Configuration Page
 */

router.get('/api/get-list-config', restrict, function (req, res, next) {
    var parameters = null;

    //Execute command for version to check connection to ems
    ems.listConfig(parameters, function (result) {
        // console.log("version result" + JSON.stringify(result));

        res.json(result);
    });
});


router.get('/api/get-default-media-folder', restrict, function (req, res, next) {

    console.log('dirConfig.mediaFolder ' + dirConfig.mediaFolder);

    res.json(dirConfig.mediaFolder);
});


router.post('/api/get-vod-files', restrict, function (req, res, next) {

    console.log('req.body ' + JSON.stringify(req.body));

    var data = req.body;

    var directory = null;

    if (data.directory != "") {
        // directory = JSON.parse('{"' + decodeURI(data.directory).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');

        //Check if it is a valid directory

        directory = data.directory;
        // directory = "";

        try {

            // Is it a directory?
            //Check if file location is a valid directory
            if (fs.lstatSync(directory).isDirectory()) {
                console.log('directory ' + JSON.stringify(directory));

                var filesToPlayList = [];
                var files_ = files_ || [];
                var files = fs.readdirSync(directory);
                for (var i in files) {
                    var name = directory + '/' + files[i];

                    console.log('name ' + name);
                    console.log('fs.statSync(name).isDirectory() ' + fs.statSync(name).isDirectory());

                    if (!fs.statSync(name).isDirectory()) {

                        var ext = name.split('.').pop();

                        console.log('ext ' + ext);

                        //Only add files that can be played
                        var fileToPlay = ["mp4", "ts", "flv", "m4v"];

                        var playFile = fileToPlay.indexOf(ext);

                        console.log('playFile ' + playFile);


                        if (playFile != -1) {

                            console.log('name to add ' + name);

                            filesToPlayList.push(files[i]);
                        }
                    }
                }

                // console.log('files '+ JSON.stringify(files));
                console.log('filesToPlayList.length ' + filesToPlayList.length);

                if (filesToPlayList.length > 0) {
                    res.json(filesToPlayList);
                } else {
                    res.json("");
                }
            }
        }
        catch (e) {
            res.json("");
        }
    }

    console.log('files ' + JSON.stringify(files));

    // res.json("");


});

router.post('/api/get-delete-vod-files', restrict, function (req, res, next) {
    console.log('req.body ' + JSON.stringify(req.body));

    var data = req.body;

    if (data.filepath != "") {
        fs.unlink(data.filepath, function (err) {

            console.log('err ' + JSON.stringify(err));

            if (err) res.json(err);
            else res.json(data.filepath);
        });
    }
});


router.get('/api/get-commands-parameters', restrict, function (req, res, next) {


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
                // var version = '166';
                var acceptedVersion = '170';
                var err = '';

                console.log("version after version " + version);

                console.log("version after ( version < acceptedVersion) " + ( version < acceptedVersion));

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
    console.log('POST: api/execute-command req.body ' + JSON.stringify(req.body));

    var data = req.body;
    var parameters = null;

    console.log('before data.parameters ' + JSON.stringify(data.parameters));

    if (data.parameters != "") {
        parameters = JSON.parse('{"' + decodeURI(data.parameters).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');

        for (var i in parameters) {
            parameters[i] = decodeURIComponent(parameters[i]);

            console.log('parameters[i] ' + parameters[i]);
        }
    }

    // console.log('after parameters '+JSON.stringify(parameters));

    //Execute command for pushStream using destination address
    ems[data.command](parameters, function (result) {
        // console.log("Execute command result" + JSON.stringify(result));

        res.json(result);
    });

});


router.get('/api/liststreams', restrict, function (req, res, next) {

    var parameters = null;

    //Execute command for version to check connection to ems
    ems.listStreams(parameters, function (result) {
        // console.log("version result" + JSON.stringify(result));

        res.json(result);
    });
});


router.get('/api/removeconfig', restrict, function (req, res, next) {

    console.log('req.query ' + JSON.stringify(req.query));

    console.log('req.query.configid ' + req.query.configid);

    var parameters = {
        id: req.query.configid
    };

    //Execute command for version to check connection to ems
    ems.removeConfig(parameters, function (result) {
        console.log("version result" + JSON.stringify(result));

        res.json(result);
    });
});

/*
 * Youtube
 */

router.get('/api/send-youtube', function (req, res, next) {
    // console.log('POST: api/send-youtube req.body ' + JSON.stringify(req.body));
    console.log('GET: api/send-youtube req.query ' + JSON.stringify(req.query));

    var data = req.query;
    var parameters = null;

    console.log('data.command ' + data.command);

    if (data.command == 'step01') {
        if (req.session.googleUser) {
            parameters = data.parameters + '&token=' + req.session.googleUser.googletoken;

            var youtubeCreate = new Buffer(socialConfig.youtubeCreate, 'base64');

            // var createBroadcastUrl = "http://webuiauth.evostream.com/verify/youtube/create?" + parameters;
            var createBroadcastUrl = youtubeCreate + parameters;

            console.log('createBroadcastUrl ' + createBroadcastUrl);

            request(createBroadcastUrl, function (error, response, body) {

                console.log('response ' + JSON.stringify(response));

                if (error) {
                    err = {
                        'error': "Failed to upload help.json"
                    };

                    res.json(error);
                }

                if (response.statusCode == 200) {
                    // var importedJSON = JSON.parse(body);
                    // res.json(importedJSON);

                    console.log('body' + JSON.stringify(body));

                    var youtubeData = JSON.parse(body);

                    console.log('youtubeData.ingestionAddress ' + youtubeData.ingestionAddress);

                    var parameters = {
                        uri: youtubeData.ingestionAddress,
                        localStreamName: data.localStreamName,
                        targetStreamName: youtubeData.streamName

                    };

                    //Execute command for pushStream to send stream to youtube
                    ems.pushStream(parameters, function (result) {
                        console.log("pushStream result" + JSON.stringify(result));
                        // res.json(result);

                        if (result.status == 'SUCCESS') {

                            //Transition Youtube Stream to Testing
                            setTimeout(function () {

                                var parameters = 'token=' + req.session.googleUser.googletoken + '&broadcastId=' + youtubeData.broadcastId + '&statusYtStream=testing';

                                var youtubeTransition = new Buffer(socialConfig.youtubeTransition, 'base64');

                                // var transitionToTestUrl = "http://webuiauth.evostream.com/verify/youtube/transition?" + parameters;
                                var transitionToTestUrl = youtubeTransition + parameters;

                                console.log('transitionToTestUrl ' + transitionToTestUrl);

                                request(transitionToTestUrl, function (error, response, body) {

                                    console.log('response ' + JSON.stringify(response));

                                    if (error) {
                                        var result = {
                                            'status': false,
                                            'broadcastId': ''
                                        };

                                        res.json(error);
                                    }

                                    if (response.statusCode == 200) {
                                        // var importedJSON = JSON.parse(body);
                                        // res.json(importedJSON);

                                        console.log('body' + JSON.stringify(body));

                                        var youtubeData = JSON.parse(body);

                                        console.log('youtubeData.broadcastId ' + youtubeData.broadcastId);

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

        console.log('req.session.googleUser.googletoken ' + req.session.googleUser.googletoken);
        console.log('data.broadcastId ' + data.broadcastId);

        if (req.session.googleUser && typeof data.broadcastId !== 'undefined' && data.broadcastId) {
            setTimeout(function () {

                var parametersToLive = 'token=' + req.session.googleUser.googletoken + '&broadcastId=' + data.broadcastId + '&statusYtStream=live';

                var transitionToLiveUrl = "http://webuiauth.evostream.com/verify/youtube/transition?" + parametersToLive;

                console.log('transitionToLiveUrl ' + transitionToLiveUrl);

                request(transitionToLiveUrl, function (error, response, body) {

                    console.log('response ' + JSON.stringify(response));

                    if (error) {
                        var result = {
                            'status': false,
                            'broadcastId': ''
                        };

                        res.json(error);
                    }

                    if (response.statusCode == 200) {
                        // var importedJSON = JSON.parse(body);
                        // res.json(importedJSON);

                        console.log('body' + JSON.stringify(body));

                        var youtubeData = JSON.parse(body);

                        console.log('youtubeData.broadcastId ' + youtubeData.broadcastId);

                        if (youtubeData.broadcastId) {

                            var result = {
                                'status': true,
                                'url': 'https://www.youtube.com/live_event_analytics?v=' + youtubeData.broadcastId
                            };
                            res.json(result);
                        }
                    }
                });
            }, 25000);
        }

    }

});


/*
 * Facebook
 */


router.get('/api/get-fb-edge', restrict, function (req, res, next) {

    console.log('get-fb-user get-fb-user get-fb-user ');

    console.log('req.query ' + JSON.stringify(req.query));

    console.log('req.session.fbUser ' + JSON.stringify(req.session.fbUser));

    var data = req.query;
    var parameters = null;


    if (req.session.fbUser) {
        parameters = data.parameters + '&token=' + req.session.fbUser.fbtoken;
        // parameters = 'edge=user&token=' + req.session.fbUser.fbtoken;

        var fbEdge = new Buffer(socialConfig.fbEdge, 'base64');

        // var getInfoUrl = "http://webuiauth.evostream.com/verify/fbvideo/info?" + parameters;
        var getInfoUrl = fbEdge + parameters;


        // console.log('createBroadcastUrl ' + createBroadcastUrl);

        request(getInfoUrl, function (error, response, body) {

            console.log('response ' + JSON.stringify(response));
            console.log('body ' + JSON.stringify(body));

            if (response.statusCode == 200) {
                res.json(body);
            }

        });

        // res.redirect(getInfoUrl);

    }

});


router.get('/api/send-facebook', function (req, res, next) {
    // console.log('POST: api/send-youtube req.body ' + JSON.stringify(req.body));
    console.log('GET: api/send-facebook req.query ' + JSON.stringify(req.query));

    var data = req.query;
    var parameters = null;

    console.log('data.command ' + data.command);


    if (req.session.fbUser) {
        parameters = data.parameters + '&token=' + req.session.fbUser.fbtoken;

        console.log('parameters ' + parameters);

        var fbVideo = new Buffer(socialConfig.fbVideo, 'base64');

        // var createFbVideoUrl = "http://webuiauth.evostream.com/verify/fbvideo/create?" + parameters;
        var createFbVideoUrl = fbVideo + parameters;

        console.log('createFbVideoUrl ' + createFbVideoUrl);

        // res.redirect(createFbVideoUrl);

        request(createFbVideoUrl, function (error, response, body) {

            console.log('response ' + JSON.stringify(response));

            if (error) {
                err = {
                    'error': "Failed to upload help.json"
                };

                res.json(error);
            }

            if (response.statusCode == 200) {
                // var importedJSON = JSON.parse(body);
                // res.json(importedJSON);

                console.log('body' + JSON.stringify(body));

                var facebookData = JSON.parse(body);
                var facebookStreamUrl = facebookData.stream_url;
                var facebookTargetProtocolUrl = 'rtmp://rtmp-api.facebook.com:80/rtmp/';

                if (data.protocol == 'rtmps') {
                    facebookStreamUrl = facebookData.secure_stream_url;
                    facebookTargetProtocolUrl = 'rtmps://rtmp-api.facebook.com:443/rtmp/';
                }

                var facebookTarget = facebookStreamUrl.replace(facebookTargetProtocolUrl, "");

                console.log('facebookTargetProtocolUrl ' + facebookTargetProtocolUrl);
                console.log('facebookTarget ' + facebookTarget);

                var parameters = {
                    uri: facebookTargetProtocolUrl,
                    localStreamName: data.localStreamName,
                    targetStreamName: facebookTarget
                };

                //Execute command for pushStream to send stream to youtube
                ems.pushStream(parameters, function (result) {
                    console.log("pushStream result" + JSON.stringify(result));
                    // res.json(result);

                    if (result.status == 'SUCCESS') {
                        var result = {
                            'status': true
                        };
                        res.json(result);
                    }
                });

            }
        });
    }


});


module.exports = router;