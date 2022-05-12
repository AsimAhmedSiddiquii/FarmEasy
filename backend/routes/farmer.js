const express = require("express");
const farmerRouter = express.Router();
const upload = require("../services/businesslogo.upload");
const bcrypt = require("bcrypt");

const farmerController = require("../controller/farmer");
const Farmer = require("../models/farmer");
const Product = require("../models/product");
const Order = require("../models/order");

farmerRouter.get("/image/:filename", farmerController.viewBusinessLogo);

farmerRouter.post(
    "/register",
    upload.single("businessLogo"),
    farmerController.newFarmer
);

farmerRouter.get("/getFarmer/:id", farmerController.getFarmerDetails);
farmerRouter.patch("/updateFarmer/:id", farmerController.updateFarmer);
farmerRouter.delete("/deleteFarmer/:id", farmerController.deleteFarmer);

farmerRouter.get('/', (req, res) => {
    res.render('farmer/login')
})

farmerRouter.post("/", (req, res) => {
    const email = req.body.email;
    const pass = req.body.pass;

    Farmer.find({
            email: email
        })
        .exec()
        .then((user) => {
            if (user.length < 1) {
                res.status(404).json({
                    message: "Farmer Not found",
                });
            } else {
                bcrypt.compare(pass, user[0].password, (err, result) => {
                    if (err) {
                        return res.status(401).json({
                            message: "Authentication Failed",
                        });
                    }
                    if (result) {
                        req.session.email = user[0].email;
                        req.session.farmerName = user[0].name;
                        req.session.farmerID = user[0]._id;
                        return res.status(200).redirect("/farmer/dashboard");
                    }
                    return res.status(401).json({
                        message: "Authentication Failed",
                    });
                });
            }
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({
                message: error,
            });
        });
});

farmerRouter.get('/register', (req, res) => {
    res.render('farmer/register')
})

farmerRouter.get('/dashboard', (req, res) => {
    if (req.session.farmerName) {
        Product.find({
            businessId: req.session.farmerID
        }).exec().then(prods => {
            res.render('farmer/dashboard', { name: req.session.farmerName, noofprod: prods.length })
        })
    } else {
        res.redirect('/farmer/unauthorized-access')
    }
})

farmerRouter.get('/products', (req, res) => {
    if (req.session.farmerID) {
        Product.find({
                businessId: req.session.farmerID
            }).select("name quantity price desc isVerified")
            .exec()
            .then(docs => {
                res.render('farmer/products/products', { name: req.session.farmerName, prodData: docs })
            })
            .catch(err => {
                console.log(err)
                res.status(500).json({
                    error: err
                })
            })
    } else {
        res.redirect('/farmer/unauthorized-access')
    }
})

farmerRouter.get('/add-product', (req, res) => {
    if (req.session.farmerID) {
        res.render('farmer/products/add-product', { name: req.session.farmerName, farmerID: req.session.farmerID })

    } else {
        res.redirect('/farmer/unauthorized-access')
    }
})

farmerRouter.get('/unauthorized-access', (req, res) => {
    res.render('farmer/500')
})

farmerRouter.get('/orders', (req, res) => {
    if (req.session.farmerID) {
        var orders = [];
        var del = [];
        Order.find()
            .populate('order.prodID')
            .exec()
            .then(docs => {
                docs.forEach(element => {
                    orders.push(element.order);
                    del.push(element.status);
                })
                res.render('farmer/orders', { name: req.session.farmerName, ordData: orders, dstatus: del, farmerID: req.session.farmerID })
            })
            .catch(err => {
                console.log(err)
                res.status(500).json({
                    error: err
                })
            })
    } else {
        res.redirect('/farmer/unauthorized-access')
    }
})

farmerRouter.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/farmer")
});

module.exports = farmerRouter;