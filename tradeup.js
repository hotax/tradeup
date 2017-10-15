/**
 * Created by clx on 2017/10/9.
 */
const path = require('path'),
    restDir = path.join(__dirname, './server/rests'),
    restRegistry = require('./netup/rests/ResourcesRestry')(restDir),
    connectDb = require('./netup/db/mongoDb/ConnectMongoDb'),
    appBuilder = require('./netup/express/AppBuilder');

var log4js = require('log4js');
log4js.configure("log4js.conf", {reloadSecs: 300});
var logger = log4js.getLogger();

module.exports = function () {
    const defaultPort = 33579;

    appBuilder.begin(__dirname)
        .setRests(restRegistry)
        .setWebRoot('/website', './client/public')
        .end();

    connectDb(function () {
        logger.info('connect mongodb success .......');
        var server = appBuilder.run(defaultPort, function () {
            logger.info('the server is listening at ' + server.address().port);
        });
    });
};

