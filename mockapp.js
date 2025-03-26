//modules
const express = require("express");
const { json, urlencoded } = require("body-parser");
//imports
const products = require('./productmanagement/product');
const users = require("./usermanagement/users")
const orders = require("./cartmanagement/order")
const update = require("./usermanagement/details")
const { authenticate } = require('./middleware');
const { connectDB, getDb } = require("./db");
//initialization
const app = express();
const PORT = 4000;

//DB connection
const startServer = async () => {
    try {
        await connectDB();
        app.use(express.json());

        // Routes
        app.use('/products', products);
        app.use('/signup', users);
        app.use('/updateuser',authenticate, update);
        app.use('/cart', authenticate, orders);

        // Server creation
        let server = app.listen(PORT, () => {
            console.log("Server listening on", PORT);
        });

        return server;
    } catch (err) {
        console.error("MongoDB connection error:", err);
        throw err; // Ensure the error is properly propagated
    }
};
// Exporting for tests
module.exports = { startServer, app };