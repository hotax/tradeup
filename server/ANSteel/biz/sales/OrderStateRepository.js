/**
 * Created by clx on 2017/12/8.
 */
const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    Model = require('../../data/models/orderState'),
    Promise = require('bluebird');

module.exports = {
    "REASON_CONFLICT": "conflict",
    "REASON_NOT_FOUND": "not found",
    listByState: function (state) {
        return Model.find({state: state})
            .then(function (data) {
                var result = [];
                data.forEach(function (each) {
                    result.push({order: each.order.toString()})
                });
                return result;
            })
    },
    init: function (orderId, state) {
        var me = this;
        return Model.findOne({order: orderId})
            .then(function (data) {
                if(data){
                    if(data && data.state != state) return Promise.reject(me.REASON_CONFLICT);
                    return {
                        order: orderId,
                        state: state
                    }
                }
                var model = new Model({
                    order: orderId,
                    state: state
                });
                return model.save()
                    .then(function (data) {
                        return data.toJSON();
                    })
            })
    },
    update: function (orderId, tostate, fromstate) {
        var me = this;
        var condition = fromstate ? {order: orderId, state: fromstate} : {order: orderId}
        return Model.update(condition, {"$set": {state: tostate}})
            .then(function (data) {
                if(data.ok && data.n === 0 && data.nModified === 0)
                    throw me.REASON_NOT_FOUND;
            })
    },
    delete: function (orderId) {
        return Model.remove({order: orderId});
    }
}