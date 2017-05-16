var express = require('express');
var router = express.Router();
var path = require('path');
var restrict = require(path.join(__dirname, '../auth/restrict'));
var winston = require('winston');

//build the api proxy
var ipApiProxy = null;
var ems = require(path.join(__dirname, "../core_modules/ems-api-core"))(ipApiProxy);

router.get('/', restrict, function (req, res, next) {
    console.log('streams part ' + JSON.stringify(req.session));

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

    var view = 'admin/streams/play';

    var fullUrl = req.protocol + '://' + req.get('host');
    var info = new Buffer(req.query.info, 'base64');
    var infoRow = JSON.parse(info);

    var streamFormat = infoRow.streamFormat;

    var vm = {
        title: 'Player - Evostream Web UI'
    };

    var playUrl = null;

    var mediaFolder = '/media/';

    if (streamFormat == 'PULL') {
        var host = req.get('host');
        vm['emsIp'] = host.replace(":" + req.app.settings.port, "");
        vm['streamName'] = infoRow.localStreamName;
    } else if (streamFormat == 'VOD') {

        var ext = 'mp4';

        var host = req.get('host');
        vm['emsIp'] = host.replace(":" + req.app.settings.port, "");

        if(infoRow.localStreamName){
            vm['streamName'] = infoRow.localStreamName;
            ext =  infoRow.localStreamName.split('.').pop();
        }else{
            vm['streamName'] = infoRow.file;
            ext =  infoRow.file.split('.').pop();
        }

        vm['emsPlayUrl'] = 'rtmp://' + vm['emsIp'] + '/vod/mp4:' + vm['streamName'];
        vm['playUrl'] = 'rtmp://' + vm['emsIp'] + '/vod/&mp4:' + vm['streamName'];
        vm['playType'] = 'rtmp/'+ext;

    } else if (streamFormat == 'DASH') {
        vm['playUrl'] = fullUrl + mediaFolder + infoRow.groupName + '/manifest.mpd';
    } else if (streamFormat == 'HLS') {
        vm['playUrl'] = fullUrl + mediaFolder + infoRow.groupName + '/playlist.m3u8';
    } else {
        streamFormat = 'OTHERS'
    }

    vm[streamFormat] = true;
    res.render(view, vm);

});

module.exports = router;