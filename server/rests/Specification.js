/**
 * Created by clx on 2017/10/13.
 */
const dbSpecifications = require('../data/Specifications');

module.exports = {
    url: '/rests/Specifications/:id',
    rests: [
        {
            type: 'read',
            handler: function (req, res) {
                return dbSpecifications.findById(req.params.id);
            }
        }
    ]
}
