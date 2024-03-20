const mongoose = require('mongoose');

const adminMessageSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const AdminMessage = mongoose.model('AdminMessage', adminMessageSchema);

module.exports = AdminMessage;
