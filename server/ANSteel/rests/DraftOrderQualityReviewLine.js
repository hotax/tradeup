/**
 * Created by clx on 2017/10/13.
 */

const salesOrders = require('../biz/sales/SalesOrders');

module.exports = {
    url: '/quality/lines/review/orders/draft',
    rests: [
        {
            type: 'query',
            element: 'DraftOrderForQualityReview',
            handler: salesOrders.listDraftsForQualityReview
        }
    ]
}
