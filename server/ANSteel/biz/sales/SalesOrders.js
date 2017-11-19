/**
 * Created by clx on 2017/11/15.
 */

const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    dbModel = require('../../data/models/salesorder'),
    genHash = require('../../../../netup/utils/GenHash'),
    saveObjToDb = require('../../../../netup/db/mongoDb/SaveObjectToDb');

const __listDraftFor = function () {
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
};

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
        return __listDraftFor();
    },
    findDraftForQualityReview: function (id) {
        return dbModel.findById(id, "orderNo productLine items.no " +
            "items.product items.spec items.qty items.unit items.due")
            .then(function (model) {
                var result = model.toJSON();
                delete result._id;
                result.id = model.id;
                return result;
            })
    },
    listDraftsForQualityReview: function () {
        return __listDraftFor();
    },
    draftQualityReview: function (body) {
        return dbModel.findById(body.id)
            .then(function (doc) {
                var now = Date.now();
                for(var i=0; i<body.items.length; i++){
                    var review = body.items[i].qualityReview;
                    if(review){
                        review.date = now;
                    }
                }
                var toupdate = {
                    __v: genHash(now.toString()),
                    modifiedDate: now,
                    items: body.items
                }
                return doc.update(toupdate);
            })
            .catch(function (err) {
                return err;
            })
    }
}
