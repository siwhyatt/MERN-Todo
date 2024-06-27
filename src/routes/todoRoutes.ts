// src/routes/todoRoutes.ts
import { Router, Response } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';

const todoRoutes = (client: MongoClient): Router => {
  const router = Router();

  // Create a new todo
  router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const { title, time, priority, projectId } = req.body;
    const userId = req.user?.userId;

    if (!title || !time || !priority || !userId) {
      return res.status(400).json({ message: 'Title, time, priority, and userId are required' });
    }

    try {
      const db = client.db();
      const newTodo = {
        userId: new ObjectId(userId),
        title,
        time,
        priority,
        projectId: projectId ? ObjectId.createFromHexString(projectId) : undefined,
        createdAt: new Date(),
      };
      const result = await db.collection('todos').insertOne(newTodo);

      const createdTodo = await db.collection('todos').findOne({ _id: result.insertedId });

      res.status(201).json(createdTodo);
    } catch (error) {
      console.error('Error creating todo:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get all todos for the logged-in user
  router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({ message: 'UserId is required' });
    }

    try {
      const db = client.db();
      const todos = await db.collection('todos').find({ userId: new ObjectId(userId) }).toArray();

      res.status(200).json(todos);
    } catch (error) {
      console.error('Error fetching todos:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Update a todo
  router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({ message: 'UserId is required' });
    }

    const updateFields: { [key: string]: any } = {};
    if (req.body.title !== undefined) updateFields.title = req.body.title;
    if (req.body.time !== undefined) updateFields.time = req.body.time;
    if (req.body.priority !== undefined) updateFields.priority = req.body.priority;
    if (req.body.projectId !== undefined) updateFields.projectId = ObjectId.createFromHexString(req.body.projectId);

    try {
      const db = client.db();
      const result = await db.collection('todos').updateOne(
        { _id: new ObjectId(id), userId: new ObjectId(userId) },
        { $set: updateFields }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Todo not found' });
      }

      res.status(200).json({ message: 'Todo updated successfully' });
    } catch (error) {
      console.error('Error updating todo:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Delete a todo
  router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({ message: 'UserId is required' });
    }

    try {
      const db = client.db();
      const result = await db.collection('todos').deleteOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Todo not found' });
      }

      res.status(200).json({ message: 'Todo deleted successfully' });
    } catch (error) {
      console.error('Error deleting todo:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  return router;
};

export default todoRoutes;

