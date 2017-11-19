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
            handler: function (req, res) {
                //TODO:应该检查req.params["id"]同body.id是否一致
                //var id = req.params["id"];
                var body = req.body;
                return salesOrders.draftQualityReview(body);
            }
        }
    ]
}

