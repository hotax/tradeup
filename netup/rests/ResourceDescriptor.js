/**
 * Created by clx on 2017/10/13.
 */
const Promise = require('bluebird'),
    restDescriptor = require('./RestDescriptor'),
    pathToRegexp = require('path-to-regexp');

module.exports = {
    attach: function (router, resourceId, resourceDesc) {
        if (!resourceDesc.url) throw 'a url must be defined!';
        if (!resourceDesc.rests || resourceDesc.rests.length < 1) throw 'no restful service is defined!';

        var urlPattern;
        var resource = {
            getUrl: function (args) {
                var params = {};
                for (var i = 0; i < urlPattern.keys.length; i++) {
                    params[urlPattern.keys[i].name] = args[i];
                }

                var path = urlPattern.toPath(params);
                return path;
            },
            attachTo: function (router) {
                function parseUrlPattern(urlPattern) {
                    var pattern = {
                        keys: [],
                    }
                    pathToRegexp(urlPattern, pattern.keys);
                    pattern.toPath = pathToRegexp.compile(urlPattern);
                    return pattern;
                }

                resourceDesc.rests.forEach(function (service) {
                    restDescriptor.attach(router, resourceId, resourceDesc.url, service);
                });
                urlPattern = parseUrlPattern(resourceDesc.url);
            }
        };
        resource.attachTo(router);
        return resource;
    }
}

