/**
 * Created by clx on 2017/10/13.
 */

module.exports = {
    url: '/rests/products/:id',
    rests: [
        {
            method: 'Get',
            handler: function (req, res) {
                return 'I am product';
            }
        }
    ]
}
