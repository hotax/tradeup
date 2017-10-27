/**
 * Created by clx on 2017/10/13.
 */
const resourceDescriptorParser = require('./ResourceDescriptor');

var __ins;
var __resources = {};

module.exports = {
    load: function (resourceDescriptors) {
        __ins = {
            getUrl: function (id, args) {
                var resource = __resources[id];
                return resource.getUrl(args);
            },
            attachTo: function (router) {
                for (key in resourceDescriptors) {
                    var resource = resourceDescriptorParser.attach(router, key, resourceDescriptors[key]);
                    __resources[key] = resource;
                }
            }
        };
        this.attachTo = __ins.attachTo;
        this.getUrl = __ins.getUrl;
        return __ins;
    }
}
