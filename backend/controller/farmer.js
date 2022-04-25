const Grid = require("gridfs-stream");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Farmer = require("../models/farmer");

let gfs;

const conn = mongoose.connection;

conn.once("open", function() {
    gfs = Grid(conn.db, mongoose.mongo);

    gfs.collection("photos");
});

module.exports.viewBusinessLogo = async(req, res, next) => {
    try {
        const file = await gfs.files.findOne({ filename: req.params.filename });

        const readStream = await gfs.createReadStream(file.filename);

        readStream.pipe(res);
    } catch (err) {
        console.log(err);
        next(err);
    }
};
// c
module.exports.newFarmer = async(req, res, next) => {
    try {
        const newFarmer = req.body;

        const checkFarmer = await Promise.all([
            Farmer.findOne({ email: newFarmer.email }).exec(),
            Farmer.findOne({ contactNumber: newFarmer.phone }).exec(),
            Farmer.findOne({ username: newFarmer.aadhaar }).exec(),
        ]);

        if (checkFarmer[0] || checkFarmer[1] || checkFarmer[2])
            return res.status(400).json({
                success: false,
                message: "Farmer already exists.",
            });

        const encryptedPassword = await bcrypt.hash(newFarmer.password, 12);
        newFarmer.password = encryptedPassword;

        Farmer.create(newFarmer).then(result => {
            res.redirect('/farmer')
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

module.exports.getFarmerDetails = async(req, res, next) => {
    try {
        const farmer = await Farmer.findById(req.params.id);

        console.log(farmer);

        if (!farmer)
            return res.status(404).json({
                success: false,
                message: "Farmer not found",
            });

        return res.status(200).json({
            success: true,
            farmer: farmer,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// u
module.exports.updateFarmer = async(req, res, next) => {
    try {
        const farmer = await Farmer.updateOne({ _id: req.params.id }, { $set: req.body }, {
            new: true,
        });
        console.log(farmer);
        return res.status(200).json({
            success: true,
            farmer: farmer,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

module.exports.deleteFarmer = async(req, res, next) => {
    try {
        await Farmer.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};