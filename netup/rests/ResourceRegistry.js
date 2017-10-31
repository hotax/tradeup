/**
 * Created by clx on 2017/10/13.
 */
const Promise = require('bluebird'),
    restDescriptor = require('./RestDescriptor'),
    transGraph = require('./StateTransitionsGraph'),
    pathToRegexp = require('path-to-regexp');

var __resources = {};
module.exports = {
    attach: function (router, resourceId, resourceDesc) {
        if (!resourceDesc.url) throw 'a url must be defined!';
        if (!resourceDesc.rests || resourceDesc.rests.length < 1) throw 'no restful service is defined!';

        var urlPattern;
        var resource = {
            getUrl: function (fromResourceId, context, req) {
                if (urlPattern.keys.length === 0) return urlPattern.toPath();
                var params = {};
                for (var i = 0; i < urlPattern.keys.length; i++) {
                    var name = urlPattern.keys[i].name;
                    if (context) params[name] = context[name];
                    if (params[name]) continue;
                    if (req && req.params) params[name] = req.params[name];
                    if (params[name]) continue;
                    if (req.query) params[name] = req.query[name];
                }

                if (resourceDesc.transitions && resourceDesc.transitions[fromResourceId]) {
                    var transition = resourceDesc.transitions[fromResourceId];
                    for (var property in transition) {
                        var pair = transition[property].split('.');
                        if (pair[0] === 'context') {
                            params[property] = context[pair[1]];
                        } else {
                            params[property] = req[pair[0]][pair[1]];
                        }
                    }
                }

                var path = urlPattern.toPath(params);
                return path;
            },
            getTransitionUrl: function (destResourceId, context, req) {
                return __resources[destResourceId].getUrl(resourceId, context, req);
            },
            getLinks: function (context, req) {
                var me = this;
                return transGraph.findTransitions(resourceId, context, req)
                    .then(function (trans) {
                        var links = [];
                        for (var key in trans) {
                            var href = me.getTransitionUrl(trans[key], context, req);
                            links.push({rel: key, href: href});
                        }
                        return links;
                    })
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
                    restDescriptor.attach(router, resource, resourceDesc.url, service);
                });
                urlPattern = parseUrlPattern(resourceDesc.url);
            }
        };
        resource.attachTo(router);
        __resources[resourceId] = resource;
        return resource;
    }
}

