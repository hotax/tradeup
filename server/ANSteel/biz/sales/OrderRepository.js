/**
 * Created by clx on 2017/12/6.
 */
const Model = require('../../data/models/salesorder');

module.exports = {
    insert: function (data) {
        var model = new Model(data);
        return model.save()
            .then(function (data) {
                var result = data.toJSON();
                result.id = data.id;
                return result;
            })
    }
}