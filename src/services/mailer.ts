import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface SendResetPasswordEmailOptions {
  to: string;
  token: string;
}

const transporter = nodemailer.createTransport({
  host: 'depro5.fcomet.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'simon@fullstack.cat',
    pass: process.env.SMTP_PASS,
  },
});

const sendResetPasswordEmail = async ({ to, token }: SendResetPasswordEmailOptions): Promise<void> => {
  const mailOptions = {
    from: `Full Stack Cat <${process.env.SMTP_USER}>`,
    to: to, // list of receivers
    subject: 'Password Reset Request', // Subject line
    text: `You requested a password reset. Please use the following link to reset your password: https://todo.fullstack.cat/reset-password?resetToken=${token}`, // plain text body
    html: `<p>You requested a password reset. Please use the following link to reset your password: <a href="https://todo.fullstack.cat/reset-password?resetToken=${token}">Reset Password</a></p>`, // html body
  };

  await transporter.sendMail(mailOptions);
};

export default sendResetPasswordEmail;

