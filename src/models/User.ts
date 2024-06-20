// src/models/User.ts
import { ObjectId } from 'mongodb';

interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  password: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
}

export default User;

