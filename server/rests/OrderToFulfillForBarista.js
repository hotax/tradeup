/**
 * Created by clx on 2017/10/13.
 */
var restbucksOrders = require('../data/hyperbucks/RestbucksOrders');

module.exports = {
    url: '/restbucks/orders/toFulfill/:id',
    rests: [
        {
            type: 'read',
            handler: function (req, res) {
                return restbucksOrders.findToFulfillById(req.params.id);
            }
        }
    ]
}
