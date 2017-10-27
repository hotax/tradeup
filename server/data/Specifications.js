/**
 * Created by clx on 2017/10/15.
 */
const Promise = require('bluebird'),
    Schema = require('./models/specification');

module.exports = {
    add: function (data) {
        var model = new Schema(data);
        return model.save();
    },
    search: function () {
    }
}
