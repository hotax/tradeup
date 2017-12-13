/**
 * Created by clx on 2017/12/5.
 */
const Promise = require('bluebird');

module.exports = function (helper) {
    return {
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
                    for(var i=0; i<ids.length; i++){
                        tasks.push(process(ids[i], i));
                    }
                    return Promise.all(tasks)
                })
                .then(function () {
                    return orders;
                })
        }
    };
};