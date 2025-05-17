// src/routes/resetPasswordRoutes.ts
import { Router, Request, Response } from 'express';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import sendResetPasswordEmail from '../services/mailer';

const resetPasswordRoutes = (client: MongoClient): Router => {
  const router = Router();
  const db = client.db(); // Get the database instance from MongoClient

  // Endpoint to request a password reset
  router.post('/request', async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
      const user = await db.collection('users').findOne({ email });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate a unique reset token
      const resetToken = randomBytes(20).toString('hex');
      const resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour

      // Save reset token and expiry in the database
      await db.collection('users').updateOne(
        { _id: user._id },
        {
          $set: {
            resetToken,
            resetTokenExpiry,
          },
        }
      );


      try {
        await sendResetPasswordEmail({
          to: user.email,
          token: resetToken,
        });
        console.log('Email sent successfully');
      } catch (error) {
        console.error('Error sending email:', error);
      }

      res.status(200).json({ message: 'Password reset email sent successfully' });
    } catch (error) {
      console.error('Error requesting password reset:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Endpoint to reset password with a valid reset token
  router.post('/reset', async (req: Request, res: Response) => {
    const { resetToken, password: newPassword } = req.body;

    if (!resetToken || !newPassword) {
      console.log('Reset token and new password are required');
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }

    try {
      const user = await db.collection('users').findOne({
        resetToken,
        resetTokenExpiry: { $gt: Date.now() }, // Check if reset token is valid
      });

      if (!user) {
        console.log('Invalid or expired reset token');
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      console.log('Reset token valid for user:', user.email);
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user's password and clear reset token fields
      await db.collection('users').updateOne(
        { _id: user._id },
        {
          $set: {
            password: hashedPassword,
            resetToken: undefined,
            resetTokenExpiry: undefined,
          },
        }
      );

      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  return router;
};

export default resetPasswordRoutes;

