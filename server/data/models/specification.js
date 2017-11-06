const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

const YarnValueSchema = new Schema(
    {
        value: [Number],
        unit: String
    }
);

YarnValueSchema.virtual('desc')
    .get(function () {
            var desc;
            if (this.value && this.value.length > 0) {
                desc = '[';
                this.value.forEach(function (n) {
                    desc += n + ',';
                });
                desc = desc.substr(0, desc.length - 1);
                desc += ']';
                if (this.unit) desc += this.unit;
            }
            return desc;
        }
    )
    .set(function (v) {
        if (!v.startsWith('[')) throw '纱支值表达式(' + v + ')错：未以“[”开头';
        var vv = v.substr(1, v.length - 1);
        if (vv.indexOf(']') < 1) throw '纱支值表达式(' + v + ')错：未包含“]”';
        var valunit = vv.split(']');
        if (valunit.length > 2) throw '纱支值表达式(' + v + ')错：包含多个“]”';
        var vals = valunit[0].split(',');
        var vs = [];
        vals.forEach(function (valStr) {
            if (isNaN(valStr)) throw '纱支值表达式(' + v + ')错：纱支数非数字'
            vs.push(Number(valStr));
        });
        this.value = vs;
        if (valunit.length === 2){
            var unit = valunit[1].trim();
            if(unit.length > 0) this.unit = valunit[1];
        }
    });

const YarnSchema = new Schema({
    warp: YarnValueSchema,
    weft: YarnValueSchema
});

YarnSchema.virtual('desc')
    .get(function () {
            return {
                warp: this.warp.desc,
                weft: this.weft.desc
            }
        }
    )
    .set(function (v) {
        if (v.warp) {
            this.warp = {};
            this.warp.desc = v.warp;
        }
        if (v.weft){
            this.weft = {};
            this.weft.desc = v.weft;
        }
    });

const SpecificationSchema = new Schema({
    code: String,    //编码
    name: String,    //名称
    desc: String,
    constructure: String,
    grey: {
        yarn: YarnSchema,
        dnsty: YarnSchema,
        width: Number,
        GSM: Number
    },
    product: {
        yarn: YarnSchema,
        dnstyBW: YarnSchema,
        dnstyAW: YarnSchema,
        width: Number,
        GSM: Number
    },
    //state: {type: Number, enum: ['draft', 'published', 'expired']},
    //author: ObjectId,
    createDate: {type: Date, default: Date.now, required: true},
    modifiedDate: {type: Date, default: Date.now, required: true}
});

module.exports = mongoose.model('Specification', SpecificationSchema);

