/**
 * Created by clx on 2017/10/13.
 */

module.exports = {
    parse: function (desc) {
        if(!desc.url) throw 'a url must be defined!';
        var resource = {
            attachTo: function (router) {
                desc.rest.forEach(function (s) {
                    router.get(desc.url, s.handler)
                })
            }
        }
        return resource;
    }
}

