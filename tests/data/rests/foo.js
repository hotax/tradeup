/**
 * Created by clx on 2017/10/13.
 */
module.exports = {
    url: '/rests/foo',
    rest: [
        {
            method: 'Get',
            handler: function (req, res) {
                res.status(200);
                res.json({name: 'foo'});
            }
        }
    ]
}