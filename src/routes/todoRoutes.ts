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
        projectId: projectId && projectId.trim() ? new ObjectId(projectId) : null, // Fixed projectId handling
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
    const includeAll = req.query.includeAll === 'true';

    if (!userId) {
      return res.status(400).json({ message: 'UserId is required' });
    }

    try {
      const db = client.db();

      // Query filters
      const filter: any = { userId: new ObjectId(userId) };

      // If includeAll is not true, filter out snoozed todos
      if (!includeAll) {
        filter.$or = [
          { snoozedUntil: { $exists: false } },
          { snoozedUntil: { $lte: new Date() } }
        ];
      }

      const todos = await db.collection('todos').find(filter).toArray();

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

    // Fixed projectId handling - only convert to ObjectId if it's a valid non-empty string
    if (req.body.projectId !== undefined) {
      if (req.body.projectId && typeof req.body.projectId === 'string' && req.body.projectId.trim().length === 24) {
        updateFields.projectId = ObjectId.createFromHexString(req.body.projectId.trim());
      } else {
        // Set to null if empty/invalid
        updateFields.projectId = null;
      }
    }

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

  router.post('/:id/snooze', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { duration } = req.body; // 'day', 'week', or 'month'
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({ message: 'UserId is required' });
    }

    if (!duration || !['day', 'week', 'month'].includes(duration)) {
      return res.status(400).json({ message: 'Valid duration is required (day, week, or month)' });
    }

    // Calculate snooze date
    const now = new Date();
    let snoozedUntil = new Date(now);

    switch (duration) {
      case 'day':
        snoozedUntil.setDate(now.getDate() + 1);
        break;
      case 'week':
        snoozedUntil.setDate(now.getDate() + 7);
        break;
      case 'month':
        snoozedUntil.setMonth(now.getMonth() + 1);
        break;
    }

    try {
      const db = client.db();
      const result = await db.collection('todos').updateOne(
        { _id: new ObjectId(id), userId: new ObjectId(userId) },
        { $set: { snoozedUntil } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Todo not found' });
      }

      res.status(200).json({
        message: 'Todo snoozed successfully',
        snoozedUntil
      });
    } catch (error) {
      console.error('Error snoozing todo:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get all snoozed todos for the logged-in user
  router.get('/snoozed', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({ message: 'UserId is required' });
    }

    try {
      const db = client.db();
      const snoozedTodos = await db.collection('todos').find({
        userId: new ObjectId(userId),
        snoozedUntil: { $exists: true, $gt: new Date() }
      }).toArray();

      res.status(200).json(snoozedTodos);
    } catch (error) {
      console.error('Error fetching snoozed todos:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Unsnooze a todo
  router.post('/:id/unsnooze', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({ message: 'UserId is required' });
    }

    try {
      const db = client.db();
      const result = await db.collection('todos').updateOne(
        { _id: new ObjectId(id), userId: new ObjectId(userId) },
        { $unset: { snoozedUntil: "" } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Todo not found' });
      }

      res.status(200).json({ message: 'Todo unsnoozed successfully' });
    } catch (error) {
      console.error('Error unsnoozeing todo:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get count of snoozed todos
  router.get('/snoozed/count', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({ message: 'UserId is required' });
    }

    try {
      const db = client.db();
      const count = await db.collection('todos').countDocuments({
        userId: new ObjectId(userId),
        snoozedUntil: { $exists: true, $gt: new Date() }
      });

      res.status(200).json({ count });
    } catch (error) {
      console.error('Error fetching snoozed count:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  return router;
};

export default todoRoutes;
