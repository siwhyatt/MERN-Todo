import { Router } from 'express';
import { MongoClient } from 'mongodb';
import { register, login, deleteUser } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const authRoutes = (client: MongoClient): Router => {
  const router = Router();

  // Register route
  router.post('/register', register(client));

  // Login route
  router.post('/login', login(client));

  // Delete route
  router.delete('/delete', authenticateToken, deleteUser(client));

  return router;
};

export default authRoutes;

