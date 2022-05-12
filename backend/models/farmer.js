const mongoose = require("mongoose");

const farmerSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    businessName: {
        type: String,
        required: true,
    },
    businessDesc: {
        type: String,
        required: true,
    },
    businessLogo: {
        type: String,
        required: true,
    },
    aadhaar: {
        type: Number,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    pincode: {
        type: Number,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
});

const Farmer = mongoose.model("Farmer", farmerSchema);

module.exports = Farmer;