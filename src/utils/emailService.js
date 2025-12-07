import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendResetCode = async (email, resetCode) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Code - Design Club IITDH',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Code</h2>
        <p>You have requested to reset your password. Here is your verification code:</p>
        <div style="background-color: #f4f4f4; padding: 15px; margin: 20px 0; text-align: center;">
          <h1 style="color: #000; letter-spacing: 5px; font-size: 32px;">${resetCode}</h1>
        </div>
        <p>This code will expire in 1 hour.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p style="color: #666; margin-top: 30px;">Best regards,<br>Design Club IITDH</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};