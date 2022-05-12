const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
    userID: { type: String, required: true },
    prodID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    quantity: { type: String, default: 1 }
});

const orderSchema = mongoose.Schema({
    userID: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    order: [cartSchema],
    razorpay_payment_id: { type: String, required: true },
    razorpay_order_id: { type: String, required: true },
    razorpay_signature: { type: String, required: true },
    status: { type: String, default: "Ordered" },
    expected: { type: String, required: true }
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;