/**
 * Created by clx on 2017/11/16.
 */
const transform = {
    transform: function (doc, ret) {
        //if(doc.modifiedDate) ret.modifiedDate = doc.modifiedDate.toJSON();
        delete ret._id;
        for (var prop in doc) {
            if (doc[prop] instanceof Date) {
                ret[prop] = doc[prop].toJSON();
            }
        }
    }
};

module.exports = {
    toObject: transform,
    toJSON: transform
};