const express = require("express");
const router = express.Router();

const Cart = require('../models/cart')

router.get('/get-cart', (req, res, next) => {
    if (req.session.loggedin) {
        Cart.find({ userID: req.session.userID })
            .populate('prodID')
            .exec()
            .then(docs => {
                var total = 0;
                docs.forEach(element => {
                    total += parseInt(element.prodID.price) * parseInt(element.quantity)
                });
                const response = {
                    cart: docs,
                    totalAmt: total.toString()
                };
                return res.render("user/cart", { cartData: response });
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

router.get('/add-to-cart/:prodID', (req, res, next) => {
    if (req.session.loggedin) {
        Cart.find({
                prodID: req.params.prodID
            })
            .exec()
            .then(doc => {
                if (doc.length <= 0) {
                    const cart = new Cart({
                        userID: req.session.userID,
                        prodID: req.params.prodID
                    });
                    cart.save().then(() => {
                        res.redirect('/cart/get-cart');
                    }).catch((e) => {
                        res.status(400).send(e);
                    })
                } else {
                    return res.status(201).json({
                        message: 'Already in Cart'
                    })
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                })
            })
    } else {
        res.redirect('/login')
    }
});

router.get('/quantity/(:cartID)/(:current)/(:type)', (req, res, next) => {
    var qty = req.params.current;

    if (req.params.type == "add") {
        qty++;
    } else {
        qty--;
    }

    if (qty < 1) {
        return res.redirect('/cart/get-cart')
    }

    Cart.findByIdAndUpdate(req.params.cartID, { quantity: qty }, function(err, docs) {
        if (err) {
            res.status(500).json({
                error: err
            })
        } else {
            return res.redirect('/cart/get-cart')
        }
    });
});

router.get('/remove-item/:cartID', (req, res, next) => {
    Cart.findByIdAndDelete(req.params.cartID, function(err, docs) {
        if (err) {
            console.log(err);
            res.status(500).json({
                error: err
            })
        } else {
            return res.redirect('/cart/get-cart')
        }
    })
});

router.get('/empty-cart', (req, res, next) => {
    Cart.deleteMany({ userID: req.session.userID }).then(function() {
        res.status(200).redirect('/cart/get-cart');
    }).catch(function(error) {
        res.status(500).json({
            error: err
        })
    });
})

module.exports = router