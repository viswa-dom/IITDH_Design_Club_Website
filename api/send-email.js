import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  const { name, email, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
    });
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail App Password
    },
  });

  // Email template (same as before)
  const mailOptions = {
    from: `"Abhikalpa Contact Form" <${process.env.EMAIL_USER}>`,
    to: 'viswavijeth35@gmail.com',
    subject: `New Contact Form Submission from ${name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: auto; background: #f9f9f9; padding: 20px; }
          .header { background: #000; color: #fff; padding: 20px; text-align: center; }
          .content { background: #fff; padding: 30px; margin-top: 20px; border-radius: 5px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #555; }
          .value { margin-top: 5px; padding: 10px; background: #f5f5f5; border-left: 3px solid #000; }
          .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #777; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ABHIKALPA</h1>
            <p>New Contact Form Submission</p>
          </div>

          <div class="content">
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${name}</div>
            </div>

            <div class="field">
              <div class="label">Email:</div>
              <div class="value">${email}</div>
            </div>

            <div class="field">
              <div class="label">Message:</div>
              <div class="value">${message}</div>
            </div>
          </div>

          <div class="footer">
            <p>This email was sent via the Abhikalpa website contact form</p>
            <p>IIT Dharwad</p>
          </div>
        </div>
      </body>
      </html>
    `,
    replyTo: email,
  };

  try {
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message,
    });
  }
}



