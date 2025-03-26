const express = require('express');
const { connectDB, getDb }=require ("../db");
const { ObjectId } = require("mongodb");
const router=express.Router();


//adding items to cart
router.post("/addToCart", async (req, res) => {
    try {
        const db = await getDb();
        const userId = req.user.userId;
        
        const { productId, quantity } = req.body;
        const parsedQuantity = parseInt(quantity, 10);
        const  product= await db.collection("products").findOne({_id: new ObjectId(productId)});
        if(!product){
            res.status(400).json({message: "product not found"})
        }
        if (product.stock < parsedQuantity) {
            return res.status(400).json({ message: "Not enough stock available" });
        }

        const userCart = await db.collection("cart").findOne({ userId: new ObjectId(userId) });

        if (userCart) {
           
            await db.collection("cart").updateOne(
                { userId: new ObjectId(userId), "items.productId": new ObjectId(productId) },
                { $inc: { "items.$.quantity": parsedQuantity } })
         }
         else  {
            
            await db.collection("cart").insertOne({
                userId: new ObjectId(userId),
                items: [{ productId: new ObjectId(productId), quantity:parsedQuantity }]
            });
         }
         
    if (userCart){
        await db.collection("products").updateOne(
            { _id: new ObjectId(productId) },
            { $inc: { stock: -parsedQuantity } }
        );
    }

        res.json({ message: "Product added to cart successfully!" });
    
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error updating cart", error: error.message });
    }

});

// odering the items
router.post("/placeorder", async (req, res) => {
    try {
        const db = await getDb();
        const userId = req.user.userId;

       
        const userCart = await db.collection("cart").findOne({ userId: new ObjectId(userId) });

        if (!userCart ) {
            return res.status(400).json({ message: "Cart is empty. Cannot place an order." });
        }

        let totalPrice = 0;
        let orderItems = [];

        
        for (let item of userCart.items) {
            const product = await db.collection("products").findOne({ _id: new ObjectId(item.productId) });

            if (!product) {
                return res.status(400).json({ message: `Product with ID not found` });
            }

            let itemTotal = product.price * item.quantity;
            totalPrice += itemTotal;

            orderItems.push({
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
                
            });

           
            await db.collection("products").updateOne(
                { _id: new ObjectId(item.productId) },
                { $inc: { stock: -item.quantity } }
            );
        }

        
        const order = {
            userId: new ObjectId(userId),
            items: orderItems,
            totalAmount: totalPrice,
            status: "completed", 
            
        };

        await db.collection("orders").insertOne(order);

        
        await db.collection("cart").deleteOne({ userId: new ObjectId(userId) });

        res.status(200).json({ message: "Order placed successfully!", order });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error placing order", error: error.message });
    }
});

//cancelling the order
router.post("/cancelorder", async (req, res) => {
    try {
        const db = await getDb();
        const { orderId } = req.body;
        const userId = req.user.userId;

        if (!orderId) {
            return res.status(400).json({ message: "Order ID is required" });
        }

        
        const order = await db.collection("orders").findOne({ 
            _id: new ObjectId(orderId),
            userId: new ObjectId(userId),
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        for (let item of order.items) {
            await db.collection("products").updateOne(
                { _id: new ObjectId(item.productId) },
                { $inc: { stock: item.quantity } }
            );
        }
        await db.collection("orders").deleteOne(
            { _id: new ObjectId(orderId) }
            
        );

        res.status(200).json({ message: "Order canceled successfully", orderId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error canceling order", error: error.message });
    }
});



module.exports=router;
