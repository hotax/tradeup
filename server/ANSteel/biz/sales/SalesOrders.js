/**
 * Created by clx on 2017/11/15.
 */

const dbModel = require('../../data/models/salesorder'),
    saveObjToDb = require('../../../../netup/db/mongoDb/SaveObjectToDb');

module.exports = {
    draft: function (data) {
        return saveObjToDb(dbModel, data);
    }
}
