/**
 * Created by clx on 2017/12/5.
 */
var __repository, __lifecycle;
module.exports = function (repository, lifecycle) {
    __repository = repository;
    __lifecycle = lifecycle;
    return {
        draft: function (draftData) {
            var order;
            return __repository.create(draftData)
                .then(function (data) {
                    order = data;
                    return __lifecycle.entry(data.id);
                })
                .then(function (data) {
                    order.state = data;
                    return order;
                })
        }
    };
};