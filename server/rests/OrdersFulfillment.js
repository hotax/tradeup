/**
 * Created by clx on 2017/10/13.
 */

var restbucksOrders = require('../data/restbucks/RestbucksOrders');

const create = function (data) {
    return restbucksOrders.add(data);
};

module.exports = {
    url: '/restbucks/orders/fulfillment',
    rests: [
        {
            type: 'create',
            target: 'OrderToFulfill',
            handler: create
        }
    ]
}
