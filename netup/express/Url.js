/**
 * Created by clx on 2017/11/14.
 */
const URL = require('url');

module.exports = {
    resolve: function (req, path) {
        return URL.resolve(req.protocol + '://' + req.get('host'), path);
    }
}