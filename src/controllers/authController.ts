// src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import { MongoClient, ObjectId } from 'mongodb';
import User from '../models/User';
import UserSettings from '../models/UserSettings';
import { generateToken } from '../utils/auth';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const register = (client: MongoClient) => async (req: Request, res: Response) => {
  const { username, email, password, captchaToken } = req.body;

  try {
    const captchaResponse = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: captchaToken
        }
      }
    );

    if (!captchaResponse.data.success || captchaResponse.data.score < 0.5) {
      return res.status(400).json({ message: "CAPTCHA verification failed" });
    }

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

export const deleteUser = (client: MongoClient) => async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const db = client.db();
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      // Delete user's todos
      await db.collection('todos').deleteMany({ userId: new ObjectId(userId) });

      // Delete user's projects
      await db.collection('projects').deleteMany({ userId: new ObjectId(userId) });

      // Delete user's settings
      await db.collection('userSettings').deleteOne({ userId: new ObjectId(userId) });

      // Delete the user
      const result = await db.collection('users').deleteOne({ _id: new ObjectId(userId) });

      if (result.deletedCount === 0) {
        throw new Error('User not found');
      }
    });

    res.status(200).json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    await session.endSession();
  }
};
