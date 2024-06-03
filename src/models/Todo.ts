// src/models/Todo.ts
import { ObjectId } from 'mongodb';

interface Todo {
  _id?: ObjectId;
  userId: ObjectId;
  projectId?: ObjectId; // Optional field to link to a project
  title: string;
  time: number; // Time in minutes
  priority: 'low' | 'medium' | 'high'; // Priority levels
  completed: boolean;
}

export default Todo;

