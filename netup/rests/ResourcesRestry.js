/**
 * Created by clx on 2017/10/13.
 */
const resourceDescriptorsLoader = require('./DirectoryResourceDescriptorsLoader');
var __ins;

module.exports = {
    create: function (dirs) {
        __ins = {
            attachTo: function (router) {
                var descs = resourceDescriptorsLoader.loadFrom(dirs);
                descs.forEach(function (desc) {
                    desc.attachTo(router);
                });
            }
        };
        this.instance = __ins;
        return __ins;
    }
}
