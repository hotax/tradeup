/**
 * Created by clx on 2017/10/14.
 */
const fs = require('fs'),
    path = require('path'),
    resourceDescriptor = require('./ResourceDescriptor');


var log4js = require('log4js');
log4js.configure("log4js.conf", {reloadSecs: 300});
var logger = log4js.getLogger();

module.exports = {
    loadFrom: function (dir) {
        var rests = [];
        var files = fs.readdirSync(dir);
        files.forEach(function (f) {
            var id = path.join(dir, f);
            var desc = require(id);
            var rest = resourceDescriptor.parse(desc);
            rests.push(rest);
        });
        return rests;
    }
}
