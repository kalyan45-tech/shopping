const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { connectDB, getDb }=require ("./db");
const secretKey = "0123456789abcdef0123456789abcdef"

//verifying the user
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; 
  
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
  
    try {
      const decoded = jwt.verify(token, secretKey);
      req.user = decoded; 
      
      next(); 
    } catch (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
  };

  //generating web token
  const generateToken = async (req,res,next) =>{
    try{
      const { email, password }= req.body;
      if (!email || !password) {
          return res.status(400).json({ message: "username or password required" });
        }
        const db=await getDb();
      const user = await db.collection("users").findOne({email});
      if (!user){
         return res.status(400).json({ message: "Invalid username" });
      }
      const match = await bcrypt.compare(password,user.password);
      if(!match){
          return res.status(400).json({ message: "Invalid credentials" });
       }
      const token = jwt.sign({ userId:user._id }, secretKey)
      ;
      return res.json({ message: "Login successful", token });
      next();
      } catch(error){
          
          res.status(400).json({ error: error.message });
      }
  }
  module.exports={authenticate , generateToken};