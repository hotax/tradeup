/**
 * Created by clx on 2017/10/13.
 */

var dbSpecifications = require('../data/Specifications');

const addSpecification = function (data) {
    return dbSpecifications.add(data);
};

module.exports = {
    url: '/rests/Specifications',
    rests: [
        {
            type: 'create',
            target: 'Specification',
            create: addSpecification
        }
    ]
}
