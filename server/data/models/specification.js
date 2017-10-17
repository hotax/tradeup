const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

const SpecificationSchema = new Schema({
    code: String,    //编码
    name: String,    //名称
    grey: {     //胚布
        yarn: { //纱支
            warp: {val: {type: [Number], default: undefined}, unit: String},    //径向
            weft: {val: {type: [Number], default: undefined}, unit: String}     //weixiang
        },
        dnsty: {
            warp: {val: {type: [Number], default: undefined}, unit: String},
            weft: {val: {type: [Number], default: undefined}, unit: String}
        },
        width: Number,
        GSM: Number
    },
    product: {
        yarn: {
            dnstyWarp: {val: {type: [Number], default: undefined}, unit: String},
            dnstyWeft: {val: {type: [Number], default: undefined}, unit: String}
        },
        dnsty: {
            BW: {
                warp: {val: {type: [Number], default: undefined}, unit: String},
                weft: {val: {type: [Number], default: undefined}, unit: String}
            },
            AW: {
                warp: {val: {type: [Number], default: undefined}, unit: String},
                weft: {val: {type: [Number], default: undefined}, unit: String}
            },
        },
        width: Number,
        GSM: Number
    },
    desc: String,   //描述
    constructure: String,    //组织
    state: {type: Number, enum: ['draft', 'published', 'expired']},
    author: ObjectId,
    createdDate: {type: Date, default: Date.now, required: true},
    modifiedDate: Date,
});

module.exports = mongoose.model('Specification', SpecificationSchema);

