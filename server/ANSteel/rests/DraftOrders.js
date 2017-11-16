/**
 * Created by clx on 2017/10/13.
 */
const salesOrders = require('../biz/sales/SalesOrders');

module.exports = {
    url: '/sales/orders/draft',
    rests: [
        {
            type: 'create',
            target: 'DraftOrder',
            handler: salesOrders.draft
        }
    ]
}
