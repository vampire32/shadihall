const connectDB = require('../../db');
const UserModel = require('../../model/userModel');
const bcrypt = require('bcryptjs');
const express = require('express');
const { MongoClient } = require('mongodb');
const router = express.Router();

connectDB();

const uri = 'mongodb+srv://admin:admin@cluster0.jxzhbxg.mongodb.net/';
const client = new MongoClient(uri);

router.use(express.json());

router.post('/register', async (req, res) => {
  try {
    await client.connect();

    const { email, password,fullname,profilepicture } = req.body;
    console.log('Received request with data:', { email, password,fullname,profilepicture});
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    const newUser = new UserModel({
      email: email,
      password: hashedPassword,
      fullname:fullname,
      profilepicture:profilepicture,

    });

    // Save the new user
  // Save the new user
const savedUser = await newUser.save();
console.log('Saved user:', savedUser);


    // Insert the new user into the 'User' collection
    const collection = client.db().collection('User');
    const result = await collection.insertOne({
      email: savedUser.email,
      password: savedUser.password,
      fullname:fullname,
      profilepicture:profilepicture,


    });

    res.status(201).json({ message: 'User registered successfully', user: savedUser });
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

module.exports = router;
