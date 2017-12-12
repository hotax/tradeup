/**
 * Created by clx on 2017/12/12.
 */
module.exports = {
    compose: function (content, state) {
        var rtn = Object.assign({}, content);
        rtn.state = state;
        return rtn;
    }
}