// src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';
import User from '../models/User';

export const register = (client: MongoClient) => async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    const db = client.db();
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser: User = { username, email, password: hashedPassword };
    const result = await db.collection('users').insertOne(newUser);

    const createdUser = await db.collection('users').findOne({ _id: result.insertedId });

    res.status(201).json({ message: 'User registered successfully', user: createdUser });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = (client: MongoClient) => async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const db = client.db();
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

