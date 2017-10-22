/**
 * Created by clx on 2017/10/13.
 */
const Promise = require('bluebird'),
    restDescriptor = require('./RestDescriptor'),
    pathToRegexp = require('path-to-regexp');

const __parseUrlPattern = function (urlPattern) {
    var pattern = {
        keys: [],
    }
    pathToRegexp(urlPattern, pattern.keys);
    pattern.toPath = pathToRegexp.compile(urlPattern);
    return pattern;
}

module.exports = {
    attach: function (router, desc) {
        if (!desc.url) throw 'a url must be defined!';
        if (!desc.rests || desc.rests.length < 1) throw 'no restful service is defined!';

        var resource = {
            getUrl: function (args) {
                var params = {};
                for(var i=0; i<this.urlPattern.keys.length; i++){
                    params[this.urlPattern.keys[i].name] = args[i];
                }

                var path = this.urlPattern.toPath(params);
                return path;
            },
            attachTo: function (router) {
                desc.rests.forEach(function (service) {
                    restDescriptor.attach(router, desc.url, service);
                });
            }
        };
        resource.attachTo(router);
        resource.urlPattern = __parseUrlPattern(desc.url);
        return resource;
    }
}

