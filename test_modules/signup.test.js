const request = require("supertest");
const express = require("express");
// const router = require("../usermanagement/users");
// const { getDb } = require("../db");
const {startServer}=require("../mockapp")
const { ObjectId } = require("mongodb");


let server ={}
authToken=" "
beforeAll(async () => {
    try {
        server = await startServer();
        if (!server) {
            throw new Error('Server failed to start');
        }
        // const db = await getDb();
        // await db.collection("users").insertOne({
        //     name: "Kiran",
        //     email: "kiran@gmail.com",
        //     password: await bcrypt.hash("correctpassword", 10) // Hash the password
        // });
    } catch (error) {
        console.error("Error in beforeAll:", error);
        throw error; // Ensure Jest stops execution if server fails
    }
  });

describe("User Signup API", () => {

    // Setup: Connect to the database before all tests
    

    test("should return 400 if name is missing", async () => {
        const res = await request(server)
            .post("/signup/signup")
            .send({ email: "test@example.com", password: "password123" });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("name is required");
    });

    test("should return 409 if user already exists", async () => {
        const res = await request(server)
            .post("/signup/signup")
            .send({ name: "John Doe", email: "test@example.com", password: "password123" });
        expect(res.status).toBe(409);
        expect(res.body.message).toBe("User already exists");
    });

    
    test("should return 200 if user inserts successfully", async () => {
        

        const res = await request(server)
            .post("/signup/signup")
            .send({ name: "william", email: "william@gmail.com", password: "william@45" });
        expect(res.status).toBe(200);
        expect(res.text).toBe("successfully inserted");
    });

    test("should return 400 if email or password is missing in login", async () => {
        const res = await request(server)
            .post("/signup/login")
            .send({ email: "king@gmail.com"});
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("username or password required");
    });

    test("should return 404 for invalid username", async () => {
        const res = await request(server)
            .post("/signup/login")
            .send({ email: "invaliduser@example.com", password: "password123" });
    
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid username");
    });
    
    test("should return 409 for invalid credentials", async () => {
        const res = await request(server)
            .post("/signup/login")
            .send({ email: "william@gmail.com", password: "wrongpass" });
    
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid credentials");
    });

    test("should return 200 for login successfull", async () => {
        const res = await request(server)
            .post("/signup/login")
            .send({ email: "william@gmail.com", password: "william@45" });
    
        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Login successful");
        authToken = res.body.token; // Store JWT token for future use
        //console.log("Stored JWT Token:", authToken);
    });

    
    

    test("should return 200 for user fetched successful", async () => {
        const res = await request(server)
            .get('/updateuser/getuser')
            .set("Authorization", `Bearer ${authToken}`);
            
    
        expect(res.status).toBe(200);
        expect(res.body.message).toBe("userdetais fetched successfully");
    });


    test("should return 200 for successful user update", async () => {
        const res = await request(server)
            .put(`/updateuser/updateuser/67d16fedce2d617d7205407e`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({ name: "John Updated"});
            
    
        expect(res.status).toBe(200);
        expect(res.body.message).toBe("updated successfully");
    });

    test("should return 200 for delete successfull", async () => {
        const res = await request(server)
            .delete("/signup/deleteuser")
            .send({ email: "william@gmail.com" });
    
        expect(res.status).toBe(200);
        expect(res.body.message).toBe("deleted successfully");
        
    });
});
