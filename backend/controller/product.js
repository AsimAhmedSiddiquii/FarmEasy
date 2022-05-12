const Grid = require("gridfs-stream");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Product = require("../models/product");

let gfs;

const conn = mongoose.connection;

conn.once("open", function() {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("photos");
});

module.exports.viewProductImage = async(req, res, next) => {
    try {
        const file = await gfs.files.findOne({ filename: req.params.filename });
        const readStream = await gfs.createReadStream(file.filename);
        readStream.pipe(res);
    } catch (err) {
        console.log(err);
        next(err);
    }
};

module.exports.uploadProduct = async(req, res, next) => {
    try {
        const newProduct = req.body;
        await Product.create(newProduct).then(result => {
            res.redirect("/farmer/products")
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

module.exports.getProductDetails = async(req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product)
            return res.status(404).json({
                success: false,
            });

        res.status(200).json({
            success: true,
            product: product,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

module.exports.deleteProduct = async(req, res, next) => {
    try {
        Product.findByIdAndDelete(req.params.id, function(err, docs) {
            if (err) {
                res.status(500).json({
                    error: err
                })
            } else {
                res.redirect("/farmer/products")
            }
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};