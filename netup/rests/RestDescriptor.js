/**
 * Created by clx on 2017/10/13.
 */
const Promise = require('bluebird');
const MEDIA_TYPE_COLLECTION_JSON = 'application/vnd.collection+json';

module.exports = {
    attach: function (router, currentResource, urlPattern, restDesc) {
        if (!restDesc.handler) throw  'a handler must be defined!';
        /*if (!restDesc.response)
         throw 'response for resource ' + resourceId + ' ' + restDesc.method.toUpperCase()
         + ' service must be defined!';*/
        router[restDesc.method.toLowerCase()](urlPattern, function (req, res) {
            var data = restDesc.handler(req, res);
            if (!data) return res.status(500).end();

            var representation;
            return Promise.resolve(data)
                .then(function (data) {
                    var responseDesc = restDesc.response;
                    if (responseDesc) {
                        var responseOkDesc = responseDesc.ok;
                        if (responseOkDesc.type === '@collection') {
                            var collectionDesc = responseOkDesc['@collection'];
                            if (!collectionDesc.id) collectionDesc.id = 'id';
                            representation = {
                                collection: {
                                    version: "1.0",
                                    href: req.originalUrl
                                }
                            };
                            if (data.data.items.length > 0) {
                                representation.collection.items = [];
                                data.data.items.forEach(function (itemData) {
                                    var item = {
                                        data: []
                                    };
                                    var properties = [];
                                    for (var property in itemData) {
                                        if (property === collectionDesc.id) {
                                            item.href = currentResource.getTransitionUrl(collectionDesc.type, itemData, req);
                                        } else {
                                            properties.push({
                                                name: property,
                                                value: itemData[property]
                                            });
                                        }
                                    }
                                    item.data = properties;
                                    representation.collection.items.push(item);
                                });
                            }
                            return currentResource.getLinks(data.data, req)
                                .then(function (links) {
                                    if (links.length > 0) {
                                        representation.collection.links = links;
                                    }
                                    res.set('Content-Type', MEDIA_TYPE_COLLECTION_JSON);
                                    return res.status(200).json(representation);
                                });
                        }
                    } else {
                        representation = data;
                    }

                    return res.status(200).json(representation);
                });
        });
    }
}

