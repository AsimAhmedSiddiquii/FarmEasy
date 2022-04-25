const express = require("express");
const productRouter = express.Router();
const upload = require("../services/product.upload");

const productController = require("../controller/product");

productRouter.post(
    "/upload",
    upload.array("images", 10),
    productController.uploadProduct
);

productRouter.get("/view/:id", productController.getProductDetails);

productRouter.get("/remove/:id", productController.deleteProduct);

module.exports = productRouter;