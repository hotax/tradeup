/**
 * Created by clx on 2017/10/13.
 */

var dbProducts = require('../data/Products');

const products = {
    search: function (req, res) {
        var query = {count: parseInt(req.query.count)};
        return dbProducts.search(query)
            .then(function (result) {
                return res.status(200).json(result);
            })
    }
}

module.exports = {
    url: '/rests/products/search',
    rest: [
        {
            method: 'Get',
            handler: products.search
        }
    ]
}
