/**
 * Created by clx on 2017/11/15.
 */

const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    dbModel = require('../../data/models/salesorder'),
    deepEqual = require('deep-equal'),
    genHash = require('../../../../netup/utils/GenHash'),
    saveObjToDb = require('../../../../netup/db/mongoDb/SaveObjectToDb');

const __listDraftFor = function () {
    return dbModel.find()
        .select('orderNo createDate')
        .sort('-modifiedDate')
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
const __fieldsForQualityReview = "orderNo productLine items.no " +
    "items.product items.spec items.qty items.due " +
    "items.qualityReview modifiedDate __v";
const __findDraftForQualityReview = function (id) {
    return dbModel.findById(id, __fieldsForQualityReview, "-modifiedDate")
        .then(function (model) {
            var result = model.toJSON();
            return result;
        })
};

module.exports = {
    checkVersion: function (id, version) {
        return dbModel.count({_id: id, __v: version})
            .then(function (count) {
                return count === 1;
            })
    },
    draft: function (data) {
        return saveObjToDb(dbModel, data);
    },
    findById: function (id) {
        return dbModel.findById(id)
            .then(function (model) {
                var result = model.toJSON();
                delete result._id;
                return result;
            })
    },
    listDrafts: function () {
        return __listDraftFor();
    },
    findDraftForQualityReview: function (id) {
        return __findDraftForQualityReview(id);
    },
    listDraftsForQualityReview: function () {
        return __listDraftFor();
    },
    draftQualityReview: function (id, body) {
        var doc, current;
        var newVersion;
        return dbModel.findById(id, __fieldsForQualityReview)
            .then(function (data) {
                if (!data) return Promise.reject("Not-Found");
                doc = data;
                current = doc.toJSON();
                var reviews = [];
                var currentReviews = [];
                for (var i = 0; i < body.items.length; i++) {
                    reviews[i] = body.items[i].qualityReview;
                    currentReviews[i] = current.items[i].qualityReview;
                    delete body.items[i].qualityReview;
                    delete current.items[i].qualityReview;
                }
                if (!deepEqual(current, body)) return Promise.reject("Concurrent-Conflict");
                var needUpdate = false;
                for (var i = 0; i < reviews.length; i++) {
                    if (!deepEqual(currentReviews[i], reviews[i])) {
                        doc.items[i].qualityReview = reviews[i];
                        needUpdate = true;
                    }
                }
                if (!needUpdate) return Promise.reject("Nothing");

                var now = new Date(Date.now());
                newVersion = {
                    __v : genHash(now.toString()),
                    modifiedDate : now
                }
                doc.__v = newVersion.__v;
                doc.modifiedDate = now;
                return doc.update(doc);
            })
            .then(function () {
                return newVersion;
            })
    }
}
