/**
 * Created by clx on 2017/11/15.
 */

const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    dbModel = require('../../data/models/salesorder'),
    saveObjToDb = require('../../../../netup/db/mongoDb/SaveObjectToDb');

const extractFromDoc = function (doc) {
    var result = model.toObject();
    delete result._id;
    result.id = model.id;
    for (var p in result) {

    }
}

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
    }
}
