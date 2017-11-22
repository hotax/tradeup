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
            }
        },
        {
            type: 'delete',
            conditional: true,
            response: {
                conflict: {
                    code: 409,
                    err: "该订单当前不在质量评审中，无法完成质量评审!"
                }
            },
            handler: {
                condition: salesOrders.checkVersion,
                handle: salesOrders.fulfillQualityReview
            }
        }

    ]
}

