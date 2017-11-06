/**
 * Created by clx on 2017/10/13.
 */
const Promise = require('bluebird');
const MEDIA_TYPE_COLLECTION_JSON = 'application/vnd.collection+json';
const MEDIA_TYPE = 'application/vnd.hotex.com+json';

const handlerMap = {
    entry: function (router, context, urlPattern, restDesc) {
        return router.get(urlPattern, function (req, res) {
            return context.getLinks()
                .then(function (links) {
                    res.set('Content-Type', MEDIA_TYPE);
                    return res.status(200).json({
                        links: links
                    });
                });
        });
    },
    create: function (router, context, urlPattern, restDesc) {
        return router.post(urlPattern, function (req, res) {
            var urlToCreatedResource, targetObject;
            return restDesc.create(req.body)
                .then(function (data) {
                    targetObject = data;
                    urlToCreatedResource = context.getTransitionUrl(restDesc.target, data, req);
                    return context.getLinks(data, req);
                })
                .then(function (links) {
                    res.set('Content-Type', MEDIA_TYPE);
                    res.set('Location', urlToCreatedResource);
                    return res.status(201).json({
                        href: urlToCreatedResource,
                        object: targetObject,
                        links: links
                    });
                })
        });
    },
    query: function (router, context, urlPattern, restDesc) {
        return router.get(urlPattern, function (req, res) {
            var representation;
            return restDesc.search(req.query)
                .then(function (data) {
                    representation = {
                        collection: {
                            self: req.originalUrl,
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
                            href: href,
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
                    representation = {
                        self: req.originalUrl,
                        object: data
                    };
                    res.set('ETag', data.__v);
                    return context.getLinks(data, req);
                })
                .then(function (links) {
                    representation.links = links;
                    res.set('Content-Type', MEDIA_TYPE);
                    return res.status(200).json(representation);
                });
        });
    }
};

module.exports = {
    attach: function (router, currentResource, urlPattern, restDesc) {
        var toAttach = handlerMap[restDesc.type.toLowerCase()];
        return toAttach(router, currentResource, urlPattern, restDesc);
    }
}

