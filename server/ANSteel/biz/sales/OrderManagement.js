/**
 * Created by clx on 2017/12/12.
 */
const Promise = require("bluebird");

module.exports = function (stateFinder, contentFinder, representer) {
    return {
        REASON_INTERNAL_DATA_ERROR: "INTERNAL DATA ERROR",
        findById: function (id) {
            var state, content;
            var reason = this.REASON_INTERNAL_DATA_ERROR;
            var findState = function () {
                return stateFinder.getState(id)
                    .then(function (data) {
                        state = data;
                    })
            };
            var findContent = function () {
                return contentFinder.findById(id)
                    .then(function (data) {
                        content = data;
                    })
            };
            return Promise.all([findState(), findContent()])
                .then(function () {
                    if (state && !content || !state && content) throw reason;
                    if (!state && !content) return null;
                    return representer.compose(content, state);
                })
        }
    }
}
