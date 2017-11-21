/**
 * Created by clx on 2017/10/13.
 */
const salesOrders = require('../biz/sales/SalesOrders');

module.exports = {
    url: '/quality/lines/review/orders/:id/draft',
    rests: [
        {
            type: 'read',
            handler: function (req, res) {
                var id = req.params["id"];
                return salesOrders.findDraftForQualityReview(id);
            }
        },
        {
            type: 'update',
            handler: {
                condition: salesOrders.checkVersion,
                handle: salesOrders.draftQualityReview
                /*handle:function (id, body) {
                 return salesOrders.draftQualityReview(id, body)
                 }*/
            }
        }
    ]
}

