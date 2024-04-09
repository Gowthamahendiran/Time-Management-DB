
const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
    name: String,
    email: String,
    fromDate: Date,
    toDate: Date,
    totalDays: Number,
    reasonLeave: String,
    message: String,
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    AdminLeaveMessage: String, 

});

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);

module.exports = LeaveRequest;
