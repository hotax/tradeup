/**
 * Created by clx on 2017/12/5.
 */
const Promise = require('bluebird');

module.exports = function (helper) {
    return {
        REASON_STATE_CONFLICT: "State_Conflict",
        REASON_CONTENT_CONFLICT: "Content_Conflict",
        REASON_STATE_NOT_FOUND: "State_Not_Found",
        draft: function (draftData) {
            var order;
            return helper.create(draftData)
                .then(function (data) {
                    order = data;
                    return helper.entryLifecycle(data.id);
                })
                .then(function (data) {
                    order.state = data;
                    return order;
                })
        },
        listDrafts: function () {
            var orders = [];
            return helper.list()
                .then(function (ids) {
                    var tasks = [];
                    var process = function (id, index) {
                        return helper.findById(id)
                            .then(function (data) {
                                orders[index] = data;
                            })
                    };
                    for (var i = 0; i < ids.length; i++) {
                        tasks.push(process(ids[i], i));
                    }
                    return Promise.all(tasks)
                })
                .then(function () {
                    return orders;
                })
        },
        update: function (orderId, version, draft) {
            var me = this;
            return helper.isDraft(orderId)
                .then(function (isDraft) {
                    if(isDraft == null) throw me.REASON_STATE_NOT_FOUND;
                    if(!isDraft) throw me.REASON_STATE_CONFLICT;
                    return helper.update(orderId, version, draft);
                })
                .then(function (data) {
                    if(data.n === 0) throw me.REASON_CONTENT_CONFLICT;
                    return data;
                })
        }
    };
};