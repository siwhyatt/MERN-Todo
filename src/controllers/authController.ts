// src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';
import User from '../models/User';
import UserSettings from '../models/UserSettings';
import { generateToken } from '../utils/auth';

export const register = (client: MongoClient) => async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    const db = client.db();

    const usersCollection = db.collection<User>('users');
    const userSettingsCollection = db.collection<UserSettings>('userSettings');

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = await usersCollection.insertOne({
      username,
      email,
      password: hashedPassword,
    });

    // Create default user settings
    await userSettingsCollection.insertOne({
      userId: newUser.insertedId,
      defaultTime: 15,
      defaultPriority: 'medium',
    });

    const token = generateToken(newUser.insertedId.toString());

    res.status(201).json({ message: 'User registered successfully', token });

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

    const token = generateToken(user._id.toString());

    res.status(200).json({ token });

  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

