/**
 * Created by clx on 2017/12/5.
 */
var __stateRepository;

module.exports = function (stateRepository) {
    __stateRepository = stateRepository;
    return {
        DRAFT: 'draft',
        acceptDraft: function (id) {
            var state = this.DRAFT;
            return __stateRepository.init(id, state)
                .then(function () {
                    return state;
                })
        }
    }
};