const express = require('express');
const { getDb }=require ("../db");
const { ObjectId } = require("mongodb");
const router=express.Router();

// adding products
router.post('/products',  async (req, res) => {
    try{
    const db= await getDb(); 
    const {name,category,price,stock,createdAt} = req.body;
    const products = db.collection("products");
    const result= await products.insertOne({name,category,price,stock,createdAt});
    res.json({ message: 'Product added' });
    }catch (error) {
       res.status(500).json({ message: "Error inserting products", error });
      }
});


module.exports=router;