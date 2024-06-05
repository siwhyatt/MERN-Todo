// src/routes/projectRoutes.ts
import { Router, Response } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';

const projectRoutes = (client: MongoClient): Router => {
  const router = Router();

  // Create a new project
  router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const { name, description } = req.body;
    const userId = req.user?.userId;

    if (!name || !userId) {
      return res.status(400).json({ message: 'Project name and userId are required' });
    }

    try {
      const db = client.db();
      const newProject = {
        userId: new ObjectId(userId),
        name,
        description,
      };
      const result = await db.collection('projects').insertOne(newProject);

      const createdProject = await db.collection('projects').findOne({ _id: result.insertedId });

      res.status(201).json(createdProject);
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get all projects for the logged-in user
  router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({ message: 'UserId is required' });
    }

    try {
      const db = client.db();
      const projects = await db.collection('projects').find({ userId: new ObjectId(userId) }).toArray();

      res.status(200).json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Update a project
  router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({ message: 'UserId is required' });
    }

    try {
      const db = client.db();
      const result = await db.collection('projects').updateOne(
        { _id: new ObjectId(id), userId: new ObjectId(userId) },
        { $set: { name, description } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Project not found' });
      }

      res.status(200).json({ message: 'Project updated successfully' });
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Delete a project
  router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({ message: 'UserId is required' });
    }

    try {
      const db = client.db();
      const result = await db.collection('projects').deleteOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Project not found' });
      }

      res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  return router;
};

export default projectRoutes;

