const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

const QuantitySchema = new Schema({
    value: Number,
    unit: String
});

const TransportationSchema = new Schema({
    "type": String,
    "dest": String,
    "package": String,
    "label": String
});

const DueSchema = new Schema({
    "type": String,
    "from": Date,
    "to": Date
});

const PriceSchema = new Schema({
    "price": Number,
    "discount": Number,
    "taxRate": Number,
    "fee": Number
});

const OrderItemSchema = new Schema({
    "no": String,
    "product": String,
    "spec": String,
    "qty": QuantitySchema,
    "transportation": TransportationSchema,
    "due": DueSchema,
    "price": PriceSchema
});

const SalesOrderSchema = new Schema({
    "orderNo": String,
    "productLine": String,
    "customer": String,
    "settlement": {
        "account": String,
        "taxType": String,
    },
    "items": [OrderItemSchema],
    "sales": String,
    "createDate": {type: Date, default: Date.now, required: true},
    "modifiedDate": {type: Date, default: Date.now, required: true}
});

module.exports = mongoose.model('SalesOrder', SalesOrderSchema);

