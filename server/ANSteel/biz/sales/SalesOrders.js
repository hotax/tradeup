/**
 * Created by clx on 2017/11/15.
 */

const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    paginatingQuery = require('../../../../netup/db/mongoDb/PaginatingQuery'),
    dbModel = require('../../data/models/salesorder'),
    saveObjToDb = require('../../../../netup/db/mongoDb/SaveObjectToDb');

module.exports = {
    draft: function (data) {
        return saveObjToDb(dbModel, data);
    },
    findById: function (id) {
        return dbModel.findById(id)
            .then(function (model) {
                var result = model.toJSON();
                delete result._id;
                result.id = model.id;
                return result;
            })
    },
    listDrafts: function () {
        return dbModel.find()
            .select('orderNo createDate')
            .sort('-createDate')
            .exec()
            .then(function (data) {
                var dataAfterHandled = [];
                data.forEach(function (element) {
                    var item = element.toJSON();
                    item.id = element.id;
                    dataAfterHandled.push(item);
                });
                return {items: dataAfterHandled};
            });
    }
}
