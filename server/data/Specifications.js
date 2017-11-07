/**
 * Created by clx on 2017/10/15.
 */
const Promise = require('bluebird'),
    paginatingQuery = require('../../netup/db/mongoDb/PaginatingQuery'),
    Schema = require('./models/specification');

var __modelToObject = function (model) {
    var result = {
        id: model.id,
        __v: model.__v,
        createDate: model.createDate,
        modifiedDate: model.modifiedDate
    };
    if (model.code) result.code = model.code;
    if (model.name) result.name = model.name;
    if (model.desc) result.desc = model.desc;
    if (model.constructure) result.constructure = model.constructure;
    if (model.grey) {
        result.grey = {};
        if (model.grey.yarn) result.grey.yarn = model.grey.yarn.desc;
        if (model.grey.dnsty) result.grey.dnsty = model.grey.dnsty.desc;
        if (model.grey.width) result.grey.width = model.grey.width;
        if (model.grey.GSM) result.grey.GSM = model.grey.GSM;
    }
    if (model.product) {
        result.product = {};
        if (model.product.yarn) result.product.yarn = model.product.yarn.desc;
        if (model.product.dnstyBW) result.product.dnstyBW = model.product.dnstyBW.desc;
        if (model.product.dnstyAW) result.product.dnstyAW = model.product.dnstyAW.desc;
        if (model.product.width) result.product.width = model.product.width;
        if (model.product.GSM) result.product.GSM = model.product.GSM;
    }
    return result;
};

var __objectToModel = function (obj) {
    var dataToAdd = {
        code: obj.code,
        name: obj.name,
        desc: obj.desc,
        constructure: obj.constructure,
        grey: {
            yarn: {},
            dnsty: {},
            width: obj.grey.width,
            GSM: obj.grey.GSM
        },
        product: {
            yarn: {},
            dnstyBW: {},
            dnstyAW: {},
            width: obj.product.width,
            GSM: obj.product.GSM
        }
    };
    var model = new Schema(dataToAdd);

    if (obj.grey) {
        if (obj.grey.yarn && (obj.grey.yarn.warp || obj.grey.yarn.weft)) {
            model.grey.yarn.desc = obj.grey.yarn;
        }
        if (obj.grey.dnsty && (obj.grey.dnsty.warp || obj.grey.dnsty.weft)) {
            model.grey.dnsty.desc = obj.grey.dnsty;
        }
    }
    if (obj.product) {
        if (obj.product.yarn && (obj.product.yarn.warp || obj.product.yarn.weft)) {
            model.product.yarn.desc = obj.product.yarn;
        }
        if (obj.product.dnstyBW && (obj.product.dnstyBW.warp || obj.product.dnstyBW.weft)) {
            model.product.dnstyBW.desc = obj.product.dnstyBW;
        }
        if (obj.product.dnstyAW && (obj.product.dnstyAW.warp || obj.product.dnstyAW.weft)) {
            model.product.dnstyAW.desc = obj.product.dnstyAW;
        }
    }
    return model;
};

module.exports = {
    add: function (data) {
        var model = __objectToModel(data);
        return model.save()
            .then(__modelToObject);
    },

    search: function (conditions) {
/*
        function rejectForInvalidPaginateParam(name) {
            return Promise.reject({
                code: 'InvalidCondition',
                reason: '分页变量' + name + '非法'
            });
        }
*/

        var query = conditions ? conditions : {};
        if (query.perpage && !Number.isInteger(query.perpage)) delete query.perpage;
        if (query.page && !Number.isInteger(query.page)) delete query.page;
        query.schema = Schema;
        query.select = 'code name desc createDate grey';
        query.sort = '-createDate';
        query.handler = function (e) {
            var data = __modelToObject(e);
            delete data.product;
            delete data.__v;
            delete data.constructure;
            delete data.modifiedDate;
            return data;
        };
        return paginatingQuery.query(query);
    },

    findById: function (id) {
        return Schema.findById(id)
            .then(function (model) {
                return __modelToObject(model);
            })
    }
}
