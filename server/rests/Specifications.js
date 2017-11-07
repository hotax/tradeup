/**
 * Created by clx on 2017/10/13.
 */

var dbProducts = require('../data/Specifications');

const addProduct = function (data) {
    return dbProducts.add(data);
};

module.exports = {
    url: '/rests/Specifications',
    rests: [
        {
            type: 'create',
            target: 'Specification',
            create: addProduct
        }
    ]
}
