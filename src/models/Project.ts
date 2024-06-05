// src/models/Project.ts
import { ObjectId } from 'mongodb';

interface Project {
  _id?: ObjectId;
  userId: ObjectId;
  name: string;
  description?: string;
}

export default Project;

