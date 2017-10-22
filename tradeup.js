/**
 * Created by clx on 2017/10/9.
 */
const path = require('path'),
    restDir = path.join(__dirname, './server/rests'),
    resourceDescriptors = require('./netup/rests/DirectoryResourceDescriptorsLoader').loadFrom(restDir),
    restRegistry = require('./netup/rests/ResourcesRestry').load(resourceDescriptors),
    connectDb = require('./netup/db/mongoDb/ConnectMongoDb'),
    appBuilder = require('./netup/express/AppBuilder');

var log4js = require('log4js');
log4js.configure("log4js.conf", {reloadSecs: 300});
var logger = log4js.getLogger();

module.exports = function () {
    const defaultPort = 33579;

    //配置view engine
    const moment = require('moment');
    var viewEngineFactory = require('./netup/express/HandlebarsFactory')(
        //按缺省规约：
        // partials目录为path.join(__dirname, './client/views') + '/partials'
        // views文件扩展名为'.hbs'
        'hbs', path.join(__dirname, './client/views'),
        {
            helpers: {
                dateMMDD: function (timestamp) {
                    return moment(timestamp).format('MM-DD');
                },
                dateYYYYMMDD: function (timestamp) {
                    return moment(timestamp).format('YYYY-MM-DD');
                }
            }
        });

    appBuilder
        .begin(__dirname)
        .setViewEngine(viewEngineFactory)
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

