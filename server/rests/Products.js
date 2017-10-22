/**
 * Created by clx on 2017/10/13.
 */

var dbProducts = require('../data/Products'),
    representationConverter = require('../../netup/rests/CollectionJsonRepresentationBuilder').parse({
        element: {
            resourceId: 'Product'
        }
    });

const products = {
    search: function (req, res) {
        var query = {count: parseInt(req.query.count)};
        return dbProducts.search(query);
    }
}

module.exports = {
    url: '/rests/products/all/search',
    rest: [
        {
            method: 'Get',
            handler: products.search,
            response: {
                representation: representationConverter
            }
        }
    ]
}
