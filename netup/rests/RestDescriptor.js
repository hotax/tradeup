/**
 * Created by clx on 2017/10/13.
 */
const MEDIA_TYPE = 'application/vnd.hotex.com+json';
const URL = require('../express/Url');

const handlerMap = {
    entry: function (router, context, urlPattern, restDesc) {
        return router.get(urlPattern, function (req, res) {
            return context.getLinks(null, req)
                .then(function (links) {
                    res.set('Content-Type', MEDIA_TYPE);
                    return res.status(200).json({
                        links: links
                    });
                })
                .catch(function (err) {
                    return res.status(500).send(err);
                })
        });
    },
    create: function (router, context, urlPattern, restDesc) {
        return router.post(urlPattern, function (req, res) {
            var urlToCreatedResource, targetObject;
            return restDesc.handler(req.body)
                .then(function (data) {
                    targetObject = data;
                    urlToCreatedResource = context.getTransitionUrl(restDesc.target, data, req);
                    return context.getLinks(data, req);
                })
                .then(function (links) {
                    res.set('Content-Type', MEDIA_TYPE);
                    res.set('Location', urlToCreatedResource);
                    var representation = {
                        href: urlToCreatedResource
                    };
                    representation[restDesc.target] = targetObject;
                    if(links.length > 0) representation.links = links;
                    return res.status(201).json(representation);
                })
                .catch(function (err) {
                    return res.status(500).send(err);
                })
        });
    },
    query: function (router, context, urlPattern, restDesc) {
        return router.get(urlPattern, function (req, res) {
            var query = Object.assign({}, req.query);
            if (query.perpage) query.perpage = parseInt(query.perpage);
            if (query.page) query.page = parseInt(query.page);
            var representation;
            return restDesc.handler(query)
                .then(function (data) {
                    var self = URL.resolve(req, req.originalUrl);
                    representation = {
                        collection: {
                            href: self,
                            perpage: data.perpage,
                            page: data.page,
                            total: data.total
                        }
                    };
                    representation.collection.items = [];
                    data.items.forEach(function (itemData) {
                        var href = context.getTransitionUrl(restDesc.element, itemData, req);
                        var copy = Object.assign({}, itemData);
                        delete copy['id'];
                        var item = {
                            link: {rel: restDesc.element, href: href},
                            data: copy
                        };
                        representation.collection.items.push(item);
                    });
                    return context.getLinks(data, req);
                })
                .then(function (links) {
                    representation.links = links;
                    res.set('Content-Type', MEDIA_TYPE);
                    return res.status(200).json(representation);
                })
                .catch(function (err) {
                    return res.status(500).send(err);
                })
        });
    },
    read: function (router, context, urlPattern, restDesc) {
        return router.get(urlPattern, function (req, res) {
            var representation;
            return restDesc.handler(req, res)
                .then(function (data) {
                    var self = URL.resolve(req, req.originalUrl);
                    representation = {
                        href: self
                    };
                    representation[context.getResourceId()] = data;
                    res.set('ETag', data.__v);
                    delete data.__v;
                    return context.getLinks(data, req);
                })
                .then(function (links) {
                    representation.links = links;
                    res.set('Content-Type', MEDIA_TYPE);
                    return res.status(200).json(representation);
                })
                .catch(function (err) {
                    return res.status(500).send(err);
                })
        });
    }
};

module.exports = {
    attach: function (router, currentResource, urlPattern, restDesc) {
        var toAttach = handlerMap[restDesc.type.toLowerCase()];
        return toAttach(router, currentResource, urlPattern, restDesc);
    }
}

