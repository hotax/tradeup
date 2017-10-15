/**
 * Created by clx on 2017/10/13.
 */
const resourceDescriptorsLoader = require('./DirectoryResourceDescriptorsLoader');

module.exports = function (dirs) {
    return {
        loader : resourceDescriptorsLoader.loadFrom,
        attachTo: function (router) {
            var descs = resourceDescriptorsLoader.loadFrom(dirs);
            descs.forEach(function (desc) {
                desc.attachTo(router);
            });
        }
    }
}