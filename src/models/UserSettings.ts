// src/models/UserSettings.ts
import { ObjectId } from 'mongodb';

interface UserSettings {
  _id?: ObjectId;
  userId: ObjectId;
  defaultTime: number;
  defaultPriority: string;
  defaultSorting: 'priority' | 'time' | 'age';
  defaultOrdering: 'ascending' | 'descending';
}

export default UserSettings;
