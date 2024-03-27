// Usermodule.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    employeeId: String,
    role: String,
    profileImage: { type: String, required: true },
    category : String,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
