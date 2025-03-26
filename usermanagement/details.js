const express = require('express');
const { connectDB, getDb }=require ("../db");
const { ObjectId } = require("mongodb");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secretKey = "0123456789abcdef0123456789abcdef"
const router=express.Router();

router.get('/getuser/',async (req , res)=>{
    try{
    const db=await getDb();
    const userId=req.user.userId;
    if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await db.collection("users").findOne({_id:new ObjectId(userId)});
    
    if (!user){
       return res.status(400).json({ message: "Invalid user" });
    }
    else{
        return res.status(200).json({message: "userdetais fetched successfully"})
    }
    
    } catch(error){
        
        res.status(400).json({ error: error.message });
    }
})
router.put('/updateUser/:id',async (req , res)=>{
    try{
    const db=await getDb();
    const userId= req.params.id;
    const updatedata= req.body;
    
    if (!userId){
       return res.status(400).json({ message: "Invalid username" });
    }
    const updatedUser = await db.collection("users").findOneAndUpdate(
        { _id: new ObjectId(userId) },  
        { $set: updatedata },           
        { returnDocument: "after" }    
    );
   res.status(200).json({message:"updated successfully"})
}catch(error){
    res.status(400).json({message:error})
}
    })


module.exports=router;