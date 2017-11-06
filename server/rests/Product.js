/**
 * Created by clx on 2017/10/13.
 */
const dbProducts = require('../data/Specifications');

module.exports = {
    url: '/rests/products/:id',
    rests: [
        {
            type: 'read',
            handler: function (req, res) {
                return dbProducts.findById(req.params.id);
            }
        }
    ]
}
