/**
 * Created by clx on 2017/10/13.
 */

module.exports = {
    parse: function (desc) {
        if (!desc.url) throw 'a url must be defined!';
        if (!desc.rest || desc.rest.length < 1) throw 'no restful service is defined!';

        var resource = {
            attachTo: function (router) {
                desc.rest.forEach(function (s) {
                    if (!s.handler) throw  'a handler must be defined!';
                    router[s.method.toLowerCase()](desc.url, function (req, res) {
                        var representation = s.handler(req, res);
                        if(!representation) return res.status(500).end();

                        if(s.response && s.response.representation){
                            representation = s.response.representation.convert(representation);
                        }
                        return res.status(200).json(representation);
                    })
                });
            }
        }
        return resource;
    }
}

