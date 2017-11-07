/**
 * Created by clx on 2017/10/29.
 */
const Promise = require('bluebird');

module.exports = {
    setResourcesNameList: function (nameList) {
    },
    findTransitions: function (resourceId, context, req) {
        var trans = {
            Home: {
                "search specifications": "ProductSearch",
                "add specification": "Products"
            },
            ProductSearch: {
                add: 'Products'
            },
            Products:{
                search: 'ProductSearch'
            },
            Product: {
                self: "Product",
                update: 'Product',
                delete: 'Product',
                search: 'ProductSearch'
            }
        };
        return Promise.resolve(trans[resourceId]);
    }
}
