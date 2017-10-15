/**
 * Created by clx on 2017/10/13.
 */
module.exports = {
    url: '/rests/foo',
    rest: [
        {
            method: 'gEt',
            handler: function (req, res) {
                res.status(200);
                res.json({name: 'foo'});
            }
        }
    ]
}