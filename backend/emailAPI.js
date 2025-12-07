// emailAPI.js - Backend API endpoint
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your Gmail App Password
  },
});

// Test email configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// POST endpoint to send email
app.post('/api/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
    });
  }

  // Email template
  const mailOptions = {
    from: `"Abhikalpa Contact Form" <${process.env.EMAIL_USER}>`,
    to: 'viswavijeth35@gmail.com',
    subject: `New Contact Form Submission from ${name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #000;
              color: #fff;
              padding: 20px;
              text-align: center;
            }
            .content {
              background-color: #fff;
              padding: 30px;
              margin-top: 20px;
              border-radius: 5px;
            }
            .field {
              margin-bottom: 15px;
            }
            .label {
              font-weight: bold;
              color: #555;
            }
            .value {
              margin-top: 5px;
              padding: 10px;
              background-color: #f5f5f5;
              border-left: 3px solid #000;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #777;
              font-size: 12px;
            }
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
    replyTo: email, // Allow direct reply to the sender
  };

  try {
    // Send email
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message,
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Email API is running' });
});

app.listen(PORT, () => {
  console.log(`Email API server running on port ${PORT}`);
});


