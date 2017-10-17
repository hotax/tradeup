const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

const UserAccountSchema = new Schema({
    name: {type: String, unique: true},
    password: {type: String, required: true},
});

module.exports = mongoose.model('UserAccount', UserAccountSchema);

