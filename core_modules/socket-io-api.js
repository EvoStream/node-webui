/**
 *
 * Copyright (c) 2017, EvoStream Inc.  All rights reserved.
 *
 * This software is provided free of charge to be used solely in conjunction
 * with the EvoStream Media Server.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the source code retain the above
 * copyright notice, this list of conditions and the following disclaimer.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 *
 * @package evostream
 * @subpackage api
 * @version 0.708
 */

/**
 * SOCKET API
 */

var winston = require('winston');
var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};

socketApi.io = io;

//load the stream service
var path = require('path');
var streamService = require(path.join(__dirname, '../services/stream-service'));

io.on('connection', function (socket) {

    var data = null;

    winston.log("info", '[webui] socket_io: updating liststreams table ');
    //Get ListStream Map
    streamService.updateListStreamsTable(data, function (updateResponse) {

        winston.log("verbose", '[webui] socket_io: sending startListstreamsMap event response: '+JSON.stringify(updateResponse));
        socket.emit('startListstreamsMap', updateResponse);

        winston.log("info", '[webui] socket_io: updating listconfig table ');
        //Get ListConfig Map
        streamService.updateListConfigTable(data, function (response) {

            winston.log("verbose", '[webui] socket_io: sending startListconfigMap event response: '+JSON.stringify(response));
            socket.emit('startListconfigMap', response);

        });

    });

});


socketApi.sendUpdateListStreamsTable = function (response) {

    winston.log("verbose", '[webui] socket_io: sending updateListstreamsMap event response: '+JSON.stringify(response));
    io.sockets.emit('updateListstreamsMap', response);
};


socketApi.sendUpdateListConfigTable = function(response) {

    winston.log("verbose", '[webui] socket_io: sending updateListconfigMap event response: '+JSON.stringify(response));
    io.sockets.emit('updateListconfigMap', response);
};


module.exports = socketApi;
