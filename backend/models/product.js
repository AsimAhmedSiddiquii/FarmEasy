const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Farmer",
    },
    name: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
        required: true,
    },
    images: {
        type: [String],
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;