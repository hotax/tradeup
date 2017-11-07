/**
 * Created by clx on 2017/10/29.
 */
const Promise = require('bluebird');

module.exports = {
    setResourcesNameList: function (nameList) {
    },
    findTransitions: function (resourceId, context, req) {
        var trans = {
            Home: {
                "search specifications": "SpecificationSearch",
                "add specification": "Specifications"
            },
            SpecificationSearch: {
                add: 'Specifications'
            },
            Specifications:{
                search: 'SpecificationSearch'
            },
            Specification: {
                self: "Specification",
                update: 'Specification',
                delete: 'Specification',
                search: 'SpecificationSearch'
            }
        };
        return Promise.resolve(trans[resourceId]);
    }
}
