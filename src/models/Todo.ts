// src/models/Todo.ts
import { ObjectId } from 'mongodb';

interface Todo {
  _id?: ObjectId;
  userId: ObjectId;
  projectId?: ObjectId;
  title: string;
  time: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export default Todo;

