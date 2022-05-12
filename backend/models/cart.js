const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
    userID: { type: String, required: true },
    prodID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    quantity: { type: String, default: 1 }
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;