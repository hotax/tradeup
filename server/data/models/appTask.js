const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

const AppTaskSchema = new Schema({
    name: {type: String, unique: true},
});

module.exports = mongoose.model('AppTask', AppTaskSchema);

