/**
 * Created by clx on 2017/10/13.
 */

var dbProducts = require('../data/Products');

const products = {
    search: function (req, res) {
        var query = {count: parseInt(req.query.count)};
        return dbProducts.search(query)
            .then(function (data) {
                var result = {
                    collection: {
                        version: '1.0',
                        href: req.url,
                        links: [],
                        items: [],
                        queries: [],
                        template: {},
                        error: {}
                    }
                };
                var items = [];
                data.data.forEach(function (itemData) {
                    var item = {
                        href: 'URI',
                        data: [],
                        links: []
                    };
                    var properties = [];
                    for (var property in itemData) {
                        if (property !== '_id') {
                            properties.push({
                                name: property,
                                value: itemData[property]
                            });
                        }
                    }
                    item.data = properties;
                    items.push(item);
                });
                result.collection.items = items;
                return res.status(200).json(result);
            })
    }
}

module.exports = {
    url: '/rests/products/all/search',
    rest: [
        {
            method: 'Get',
            handler: products.search,
            response: {
                representation: {
                    type: 'Collection+JSON',
                    element:{
                        resourceId:'./Product'
                    }
                }
            }
        }
    ]
}
