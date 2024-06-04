// src/models/User.ts
import { ObjectId } from 'mongodb';

interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  password: string;
}

export default User;

