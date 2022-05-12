const express = require("express");
const mongoose = require("mongoose");
const Cart = require("../models/cart");
const Order = require("../models/order");
const userRouter = express.Router();
const Razorpay = require('razorpay');
const Product = require("../models/product");
const User = require("../models/user");

require("dotenv").config();

var instance = new Razorpay({
    key_id: process.env.RAZOR_ID,
    key_secret: process.env.RAZOR_SECRET,
});

userRouter.get('/', (req, res) => {
    Product.find().exec().then(prods => {
        res.render('user/index', { products: prods })
    })
})

userRouter.get('/product/(:id)', (req, res) => {
    Product.find({
            _id: req.params.id
        }).populate('businessId')
        .exec().then(prods => {
            res.render('user/product', { product: prods[0] })
        })
})

userRouter.get('/login', (req, res) => {
    if (req.session.userID) {
        req.session.destroy();
    }
    res.render('user/login')
})

userRouter.get('/signup', (req, res) => {
    res.render('user/signup')
})

userRouter.post("/signup", (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then((user) => {
            if (user.length <= 0) {
                var userData = new User({
                    _id: new mongoose.Types.ObjectId(),
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    phone: req.body.phone
                })
                userData.save().then(result => {
                    res.redirect('/login')
                })
            } else {
                return res.status(404).json({
                    message: "Already Exists!",
                });
            }

        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: err,
            });
        });
});

userRouter.post("/login", (req, res, next) => {
    const useremail = req.body.email;
    const password = req.body.password;

    User.find({
            email: useremail,
            password: password,
        })
        .exec()
        .then((user) => {
            if (user.length < 1) {
                res.status(404).json({
                    message: "User Not found",
                });
            } else {
                req.session.loggedin = true;
                req.session.userID = user[0]._id;
                console.log(req.session.userID);
                res.status(200).redirect("/");
            }
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({
                message: error,
            });
        });
});

userRouter.post('/create-order', (req, res) => {
    var options = {
        amount: parseInt(req.body.amount) * 100,
        currency: "INR",
        receipt: "rcp_receipt"
    };
    instance.orders.create(options, function(err, order) {
        res.send({ orderId: order.id, amount: order.amount })
    });
})

userRouter.get('/checkout/(:price)', (req, res) => {
    if (req.session.userID) {
        if (parseInt(req.params.price) <= 0) {
            res.redirect('/cart/get-cart')
        } else {
            res.render('user/checkout', { amount: req.params.price })
        }
    } else {
        res.redirect('/login')
    }
})

userRouter.post('/add-order', (req, res) => {
    if (req.session.userID) {
        Cart.find({ userID: req.session.userID })
            .exec()
            .then(result => {
                var date = new Date();
                date.setDate(date.getDate() + 7);
                var orderData = new Order({
                    _id: new mongoose.Types.ObjectId(),
                    userID: req.session.userID,
                    order: result,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    mobile: req.body.mobile,
                    address: req.body.address,
                    expected: date,
                    razorpay_payment_id: req.body.razorpay_payment_id,
                    razorpay_order_id: req.body.razorpay_order_id,
                    razorpay_signature: req.body.razorpay_signature,
                })
                orderData.save().then(result => {
                    Cart.deleteMany({ userID: req.session.userID }).then(function() {
                        res.redirect("/my-orders")
                    }).catch(function(error) {
                        res.status(500).json({
                            error: err
                        })
                    });
                })
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
    } else {
        res.redirect('/login')
    }
})

userRouter.get('/my-orders', (req, res, next) => {
    if (req.session.loggedin) {
        var orders = [];
        var del = [];
        Order.find({ userID: req.session.userID })
            .populate('order.prodID')
            .exec()
            .then(docs => {
                docs.forEach(element => {
                    orders.push(element.order);
                    del.push(element.status);
                })
                console.log(orders);
                return res.render("user/orders", { orderData: orders, delivery: del });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
    } else {
        res.redirect("/login")
    }
});

module.exports = userRouter;