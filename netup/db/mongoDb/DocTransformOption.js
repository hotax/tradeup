/**
 * Created by clx on 2017/11/16.
 */
const transform = {
    transform: function (doc, ret) {
        //ret.id = doc.id;
        delete ret._id;
    }
};

module.exports = {
    toObject: transform,
    toJSON:transform
};