/**
 * Created by clx on 2017/10/13.
 */

var restbucksOrders = require('../data/hyperbucks/RestbucksOrders');

const findOrderToFulfill = function (data) {
    return restbucksOrders.findOrderToFulfill(data);
};

module.exports = {
    url: '/restbucks/orders/FindOrderToFulfill',
    rests: [
        {
            type: 'query',
            element: 'OrderToFulfill',
            handler: findOrderToFulfill
        }
    ]
}
