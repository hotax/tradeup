/**
 * Created by clx on 2017/10/13.
 */
const Promise = require('bluebird'),
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
    parse: function (desc) {
        if (!desc.url) throw 'a url must be defined!';
        if (!desc.rest || desc.rest.length < 1) throw 'no restful service is defined!';

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
                desc.rest.forEach(function (service) {
                    if (!service.handler) throw  'a handler must be defined!';
                    router[service.method.toLowerCase()](desc.url, function (req, res) {
                        var data = service.handler(req, res);
                        if(!data) return res.status(500).end();

                        var representation;
                        return Promise.resolve(data)
                            .then(function (data) {
                                representation = data;
                                if(service.response && service.response.representation){
                                    representation = service.response.representation.convert({
                                        url: req.url,
                                        data: representation
                                    });
                                }
                                return res.status(200).json(representation);
                            });
                    });
                });
            }
        };
        resource.urlPattern = __parseUrlPattern(desc.url);
        return resource;
    }
}

