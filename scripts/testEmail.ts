import sendResetPasswordEmail from "../src/services/mailer";

(async () => {
  try {
    await sendResetPasswordEmail({
      to: 'siwhyatt@gmail.com',
      token: 'your-reset-token',
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
})();

