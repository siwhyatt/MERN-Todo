import { Router } from 'express';
import { MongoClient } from 'mongodb';
import { register, login } from '../controllers/authController';

const authRoutes = (client: MongoClient): Router => {
  const router = Router();

  // Register route
  router.post('/register', register(client));

  // Login route
  router.post('/login', login(client));

  return router;
};

export default authRoutes;

