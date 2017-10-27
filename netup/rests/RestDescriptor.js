/**
 * Created by clx on 2017/10/13.
 */
const Promise = require('bluebird');

module.exports = {
    attach: function (router, resourceId, urlPattern, restDesc) {
        if (!restDesc.handler) throw  'a handler must be defined!';
        router[restDesc.method.toLowerCase()](urlPattern, function (req, res) {
            var data = restDesc.handler(req, res);
            if (!data) return res.status(500).end();

            var representation;
            return Promise.resolve(data)
                .then(function (data) {
                    representation = data;
                    var resDesc = restDesc.response;
                    if (resDesc && resDesc.representation) {
                        var converter = restDesc.response.representation;
                        representation = converter.convert({
                            url: req.url,
                            data: data
                        });
                        converter.writeHead(res);
                    }
                    return res.status(200).json(representation);
                });
        });
    }
}

