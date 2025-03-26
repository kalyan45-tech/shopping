//modules
const express = require("express");
//const { json, urlencoded } = require("body-parser");
//imports
const products =require('./productmanagement/product');
const users=require("./usermanagement/users")
const orders = require("./cartmanagement/order")
const update= require("./usermanagement/details")
const {authenticate}=require('./middleware');
const { connectDB, getDb }=require ("./db");
//initialization
const app=express();
const PORT = 4000;

//DB connection
let data = connectDB().then(async data =>{
    app.use(express.json());
    //routes
    app.use('/products',products);
    app.use('/signup',users);
    app.use('/updateuser',authenticate,update);
    app.use('/cart',authenticate,orders);

})
.catch(err =>{
    console.log("mongodb error",err);
});
//server creation
app.listen(PORT, () => {
    console.log(`Server is running on 4000`);
});