/**
 * Created by clx on 2017/12/5.
 */
var __stateRepository;

module.exports = function (stateRepository) {
    __stateRepository = stateRepository;
    return {
        DRAFT: 'draft',
        BIZREVIEW: 'bizreview',
        FINACIALREVIEW: 'finacialreview',
        EXECUTING: 'executing',
        STOP: 'stop',
        CLEARED: 'cleared',
        acceptDraft: function (id) {
            var state = this.DRAFT;
            return __stateRepository.init(id, state)
                .then(function () {
                    return state;
                })
        },
        listDrafts: function () {
            return __stateRepository.listByState(this.DRAFT);
        },
        listBizReview: function () {
            return __stateRepository.listByState(this.BIZREVIEW);
        },
        listFinacialReview: function () {
            return __stateRepository.listByState(this.FINACIALREVIEW);
        },
        listExecuting: function () {
            return __stateRepository.listByState(this.EXECUTING);
        },
        listStop: function () {
            return __stateRepository.listByState(this.STOP);
        },
        listCleared: function () {
            return __stateRepository.listByState(this.CLEARED);
        }
    }
};