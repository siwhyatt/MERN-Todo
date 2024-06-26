import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';
import authRoutes from './routes/authRoutes';
import todoRoutes from './routes/todoRoutes';
import projectRoutes from './routes/projectRoutes';
import resetPasswordRoutes from './routes/requestResetPasswords';
import userSettingRoutes from './routes/userSettingRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGO_URI as string;
if (!uri) {
  console.error('Mongo URI not properly defined in environment variable');
  process.exit(1);
}
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectDB() {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');

    // Routes
    app.use('/api/auth', authRoutes(client));
    app.use('/api/todos', todoRoutes(client));
    app.use('/api/projects', projectRoutes(client));
    app.use('/api/reset-password', resetPasswordRoutes(client));
    app.use('/api/user-settings', userSettingRoutes(client));

    // Sample route
    app.get('/', (req: Request, res: Response) => {
      res.send('Hello, world!');
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

connectDB();

export default app;

