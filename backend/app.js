const express = require("express");
const app = express();
const session = require('express-session');

const farmerRouter = require("./routes/farmer");
const productRouter = require("./routes/product");
const userRouter = require("./routes/users");
const cartRoute = require("./routes/cart");

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/img', express.static(__dirname + 'public/img'))
app.use('/font', express.static(__dirname + 'public/font'))
app.use('/vendor', express.static(__dirname + 'public/vendor'))
app.use('/components', express.static(__dirname + 'public/components'))
app.use('/uploads', express.static(__dirname + 'public/uploads'))
app.use('/boot', express.static(__dirname + 'public/boot'))

app.set('views', '././views')
app.set('view engine', 'ejs')

app.use("/", userRouter);
app.use("/farmer", farmerRouter);
app.use("/product", productRouter);
app.use("/cart", cartRoute);

module.exports = app;