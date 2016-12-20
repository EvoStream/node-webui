var express = require('express');
var router = express.Router();

var path = require('path');
var restrict = require(path.join(__dirname, '../auth/restrict'));

var ems = require(path.join(__dirname, "../core_modules/ems-api-core"))(null);

/* GET dashboard listing. */
router.get('/', restrict, function(req, res, next) {
    console.log('api-exporer part '+JSON.stringify(req.session));

    var parameters = null;

    //Execute command for pushStream using destination address
    ems.version(parameters, function(result) {
        console.log("version result" + JSON.stringify(result));
        
        var view = 'admin/error';

        if (result.status == 'SUCCESS') {
            view = 'admin/api-explorer';
        }

        var vm = {
            title: 'API Explorer - Evostream Web UI',
            email: req.user ? req.user.email : null,
            apiExplorerActive: "active",
            layout: 'admin/layout',
        }
        res.render(view, vm);

    });

});

module.exports = router;