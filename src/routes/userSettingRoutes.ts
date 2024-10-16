// src/routes/userSettingRoutes.ts
import { Router, Response } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';

const userSettingRoutes = (client: MongoClient): Router => {
  const router = Router();

  // Get all userSettings for the logged-in user
  router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({ message: 'UserId is required' });
    }

    try {
      const db = client.db();
      const userSettings = await db.collection('userSettings').findOne({ userId: new ObjectId(userId) });

      if (!userSettings) {
        return res.status(404).json({ message: 'User settings not found' });
      }

      res.status(200).json(userSettings);
    } catch (error) {
      console.error('Error fetching userSettings:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  // Update user settings
  router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({ message: 'UserId is required' });
    }

    const updateFields: { [key: string]: any } = {};
    if (req.body.defaultTime !== undefined) updateFields.defaultTime = req.body.defaultTime;
    if (req.body.defaultPriority !== undefined) updateFields.defaultPriority = req.body.defaultPriority;
    if (req.body.defaultSorting !== undefined) updateFields.defaultSorting = req.body.defaultSorting;
    if (req.body.defaultOrdering !== undefined) updateFields.defaultOrdering = req.body.defaultOrdering;

    try {
      const db = client.db();
      const result = await db.collection('userSettings').updateOne(
        { _id: new ObjectId(id), userId: new ObjectId(userId) },
        { $set: updateFields }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Settings not found' });
      }

      res.status(200).json({ message: 'Settings updated successfully' });
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  return router;
};

export default userSettingRoutes;


