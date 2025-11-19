const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    //profilePicture: { type: String }, //if we have the time to make it 
    role: { type: String,
    enum: ['customer', 'staff', 'admin'], required: true },
    otp: { type: String }, //for the forgot password feature if we make it
    otpExpires: { type: Date },
    //for disabling scammers , done by admins
    disabled: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
