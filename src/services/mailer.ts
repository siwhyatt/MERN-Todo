import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

interface SendResetPasswordEmailOptions {
  to: string;
  token: string;
}

/**
 * Sends a reset password email using Gmail API
 * Drop-in replacement for the original nodemailer implementation
 */
const sendResetPasswordEmail = async ({ to, token }: SendResetPasswordEmailOptions): Promise<void> => {
  try {
    // Check if required environment variables are set
    const requiredVars = [
      'GMAIL_CLIENT_ID',
      'GMAIL_CLIENT_SECRET',
      'GMAIL_REFRESH_TOKEN',
      'GMAIL_USER_EMAIL'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Create OAuth2 client - verify credentials are definitely available
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    // const redirectUri = process.env.GMAIL_REDIRECT_URI;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error('OAuth2 credentials are not properly configured');
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      // redirectUri
    );

    // Set credentials explicitly
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });

    // Log to verify the refresh token is set
    console.log('OAuth2 client created with refresh token:',
      refreshToken.substring(0, 5) + '...' + refreshToken.substring(refreshToken.length - 5));

    // Get Gmail API client
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Create email content
    const subject = 'Password Reset Request';
    const resetLink = `https://todo.fullstack.cat/reset-password?resetToken=${token}`;

    // Creating the email content with both text and HTML versions
    const textContent = `You requested a password reset. Please use the following link to reset your password: ${resetLink}`;
    const htmlContent = `<p>You requested a password reset. Please use the following link to reset your password: <a href="${resetLink}">Reset Password</a></p>`;

    // Create the email in RFC 822 format with multipart content
    const email = [
      `From: "Full Stack Cat" <${process.env.GMAIL_USER_EMAIL}>`,
      `To: ${to}`,
      'Content-Type: multipart/alternative; boundary="boundary-string"',
      'MIME-Version: 1.0',
      `Subject: ${subject}`,
      '',
      '--boundary-string',
      'Content-Type: text/plain; charset=utf-8',
      '',
      textContent,
      '',
      '--boundary-string',
      'Content-Type: text/html; charset=utf-8',
      '',
      htmlContent,
      '',
      '--boundary-string--'
    ].join('\r\n');

    // Encode the email in base64 URL-safe format
    const encodedEmail = Buffer.from(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send the email using Gmail API
    console.log('Attempting to send email to:', to);
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail
      }
    });

    console.log(`Password reset email sent to ${to}. Message ID: ${response.data.id}`);
  } catch (error: unknown) {
    // Properly type the error and extract message
    let errorMessage = 'Failed to send reset password email';

    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    } else if (typeof error === 'object' && error !== null) {
      // For API errors that might not be standard Error objects
      const errorObj = error as Record<string, unknown>;
      if ('message' in errorObj && typeof errorObj.message === 'string') {
        errorMessage = `${errorMessage}: ${errorObj.message}`;
      }

      // Log additional Google API error details if available
      if ('response' in errorObj && typeof errorObj.response === 'object' && errorObj.response !== null) {
        const response = errorObj.response as Record<string, unknown>;
        if ('data' in response) {
          console.error('API Error Response:', response.data);
        }
        if ('status' in response) {
          console.error('Status Code:', response.status);
        }
      }
    } else if (typeof error === 'string') {
      errorMessage = `${errorMessage}: ${error}`;
    }

    console.error('Error sending reset password email:', error);
    throw new Error(errorMessage);
  }
};

export default sendResetPasswordEmail;
