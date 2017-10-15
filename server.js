const app = require('./tradeup'),
    cluster = require('cluster'),
    os = require('os');

var log4js = require('log4js');
log4js.configure("log4js.conf", {reloadSecs: 300});
var logger = log4js.getLogger();

require('dotenv').config();

if(process.env.DEVELOPMENT){
    app();
    return;
}

if (cluster.isMaster) {
    var cpus = os.cpus().length;
    for (var i = 0; i < cpus; i++) {
        cluster.fork();
        cluster.on('exit', function (worker, code) {
            if (code != 0 && !worker.suicide) {
                logger.info('Worker crashed. ~~~~~~~~~~~~~~~~~~~~~~~~~');
                /*logger.info('Worker crashed. Starting a new worker ~~~~~~~~~~~~~~~~~~~~~~~~~');
                 cluster.fork();*/
            }
        });
    }
}
else {
    app();
}
