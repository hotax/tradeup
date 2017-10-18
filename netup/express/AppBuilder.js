/**
 * Created by clx on 2017/10/9.
 */
const util = require('util'),
    path = require('path'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    xmlBodyParser = require('express-xml-bodyparser'),
    express = require('express'),
    app = express();

const registerRests = require('./../rests/ResourcesRestry');

var log4js = require('log4js');
log4js.configure("log4js.conf", {reloadSecs: 300});
var logger = log4js.getLogger();

module.exports.begin = function (base) {
    var baseDir = base || __dirname;
    var restsRegistry, viewEngine;

    initappobject();
    this.setWebRoot = function (root, dir) {
        app.use(root, express.static(path.join(baseDir, dir)));
        return this;
    };
    this.setViewEngine = function (engine) {
        restsRegistry = engine;
        return this;
    };
    this.setRests = function (rests) {
        restsRegistry = rests;
        return this;
    };
    this.end = function () {
        if(viewEngine) viewEngine.attachTo(app);
        if(restsRegistry) restsRegistry.attachTo(app);
        return app;
    };
    this.run = function(portNum, callback){
        var port = process.env.PORT || portNum;
        return app.listen(port, process.env.IP || "0.0.0.0", callback);
    };

    return this;

    function initappobject() {
        app.use(morgan('dev')); // used as logger
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        app.use(xmlBodyParser({
            explicitArray: false,
            normalize: false,
            normalizeTags: false,
            trim: true
        }));
    }
}