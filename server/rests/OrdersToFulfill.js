/**
 * Created by clx on 2017/10/13.
 */

var restbucksOrders = require('../data/restbucks/RestbucksOrders');

const listOrdersToFulfill = function (data) {
    return restbucksOrders.listOrdersToFulfill(data);
};

module.exports = {
    url: '/restbucks/orders/OrdersToFulfill',
    rests: [
        {
            type: 'query',
            element: 'OrderToFulfill',
            handler: listOrdersToFulfill
        }
    ]
}
