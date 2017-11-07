/**
 * Created by clx on 2017/10/13.
 */
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
                })
                .catch(function (err) {
                    return res.status(500).send(err);
                })
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
            return restDesc.search(query)
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

