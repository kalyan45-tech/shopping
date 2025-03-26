const express = require('express');
const { connectDB, getDb }=require ("../db");
const { ObjectId } = require("mongodb");
const {generateToken}=require('../middleware');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secretKey = "0123456789abcdef0123456789abcdef"
const router=express.Router();

//user registration
router.post('/signup', async (req , res) =>{
    try{
    const db = await getDb();
    const {name, email, password } = req.body;
    if (!name) {
        return res.status(400).json({ message: "name is required" });
      }
    else if (!email || !password){
        return res.status(400).json({message:"please provide username or password"})
    }
    const existinguser = await db.collection("users").findOne({ email });
    if (existinguser) {
      return res.status(409).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password,10);
    const details= await db.collection("users").insertOne({name, email, password: hashedPassword });
    res.send("successfully inserted")
    }
    catch (error) {
        
        res.status(500).json({ error: error.message });
      }
});


router.delete('/deleteuser',async(req,res)=>{
    try{
        const db = await getDb();
        const { email } = req.body; 
        const tap= await db.collection("users").deleteOne({email})
        res.status(200).json({message:"deleted successfully"})
    }
    catch(error){
        res.status(400).json({message:error})
        console.log(error)
    }
})

//user login
router.post('/login',generateToken,async (req , res)=>{
    try{
        return res.status(200).json({message:"login successfully"})
    }catch(error){
        return res.json({message:"login failed"})
    }
})
//     try{
//     const { email, password }= req.body;
//     if (!email || !password) {
//         return res.status(400).json({ message: "username or password required" });
//       }
//       const db=await getDb();
//     const user = await db.collection("users").findOne({email});
//     if (!user){
//        return res.status(400).json({ message: "Invalid username" });
//     }
//     const match = await bcrypt.compare(password,user.password);
//     if(!match){
//         return res.status(400).json({ message: "Invalid credentials" });
//      }
//     const token = jwt.sign({ userId:user._id }, secretKey)
//     ;
//     return res.json({ message: "Login successful", token });
//     } catch(error){
        
//         res.status(400).json({ error: error.message });
//     }
// })



module.exports=router;