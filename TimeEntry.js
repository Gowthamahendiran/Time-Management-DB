const mongoose = require('mongoose');

const timeEntrySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timeIn: Date,
    timeOut: Date
}, { timestamps: true });

const TimeEntry = mongoose.model('TimeEntry', timeEntrySchema);

module.exports = TimeEntry;
