const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

const transform = {
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.__v;
        ret.order = ret.order.toString();
    }
};

const OrderStateSchema = new Schema({
    "order": ObjectId,
    "state": String
}, {
    toJSON: transform
});

module.exports = mongoose.model('OrderState', OrderStateSchema);

