/**
 * Created by clx on 2017/12/6.
 */
const Promise = require('bluebird'),
    Model = require('../../data/models/salesorder');

module.exports = {
    checkVersion: function (id, version) {
        return Model.count({_id: id, __v: version})
            .then(function (count) {
                return count === 1;
            })
    },
    insert: function (data) {
        var model = new Model(data);
        return model.save()
            .then(function (data) {
                var result = data.toJSON();
                result.id = data.id;
                return result;
            })
    },
    update: function (id, data) {
        var version = data.__v;
        if (version === undefined || version === null) return Promise.resolve(false);
        var update = Object.assign({}, data);
        update.__v++;
        return Model.update({_id: id, __v: version}, {"$set": update})
            .then(function (data) {
                return data.ok && data.n === 1 && data.nModified === 1;
            })
    },
    delete: function (id, version) {
        return Model.findOne({_id: id, __v: version})
            .then(function (data) {
                if (!data) return Promise.reject(false);
                return data.remove()
                    .then(function () {
                        return true;
                    })
            })
            .catch(function (data) {
                return false;
            })
    },
    find: function (id) {
        return Model.findById(id)
            .then(function (data) {
                return data ? data.toJSON() : null;
            })
    }
}