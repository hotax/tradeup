/**
 * Created by clx on 2017/10/13.
 */

var dbSpecifications = require('../data/Specifications');

const specificationSearch = function (query) {
    return dbSpecifications.search(query);
}

module.exports = {
    url: '/rests/Specifications/all/search',
    rests: [
        {
            type: 'query',
            element: 'Specification',
            search: specificationSearch
        }
    ]
}
