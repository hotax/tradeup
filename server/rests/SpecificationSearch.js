/**
 * Created by clx on 2017/10/13.
 */

var dbProducts = require('../data/Specifications');

const productSearch = function (query) {
    return dbProducts.search(query);
}

module.exports = {
    url: '/rests/Specifications/all/search',
    rests: [
        {
            type: 'query',
            element: 'Specification',
            search: productSearch
        }
    ]
}
