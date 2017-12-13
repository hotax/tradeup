/**
 * Created by clx on 2017/12/5.
 */

module.exports = function (stateRepository) {
    return {
        DRAFT: 'draft',
        BIZREVIEW: 'bizreview',
        FINACIALREVIEW: 'finacialreview',
        EXECUTING: 'executing',
        STOP: 'stop',
        CLEARED: 'cleared',
        acceptDraft: function (id) {
            var state = this.DRAFT;
            return stateRepository.create(id, state)
                .then(function () {
                    return state;
                })
        },
        submitDraft: function (id) {
            var me = this;
            return stateRepository.update(id, me.BIZREVIEW, me.DRAFT)
                .then(function () {
                    return me.BIZREVIEW;
                })
        },
        listDrafts: function () {
            return stateRepository.listByState(this.DRAFT);
        },
        listBizReview: function () {
            return stateRepository.listByState(this.BIZREVIEW);
        },
        listFinacialReview: function () {
            return stateRepository.listByState(this.FINACIALREVIEW);
        },
        listExecuting: function () {
            return stateRepository.listByState(this.EXECUTING);
        },
        listStop: function () {
            return stateRepository.listByState(this.STOP);
        },
        listCleared: function () {
            return stateRepository.listByState(this.CLEARED);
        }
    }
};