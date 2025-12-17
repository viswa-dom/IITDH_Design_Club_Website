// api/user-disable.js
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"Abhikalpa Admin" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Email sending failed:", error);
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, action, duration, reason } = req.body;
    // action: "disable" | "delete"
    // duration: number (in hours) for disable, or "permanent"
    // reason: optional string explaining why

    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    const { data: adminUser, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || adminUser.user.app_metadata?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden - Admin only" });
    }

    // Get user details before action
    const { data: targetUser, error: fetchError } = await supabase.auth.admin.getUserById(userId);
    
    if (fetchError || !targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const userEmail = targetUser.user.email;

    if (action === "disable") {
      // Disable user for custom duration
      const banDuration = duration === "permanent" ? "876000h" : `${duration}h`;
      
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: banDuration,
      });

      if (error) {
        console.error("Disable user error:", error);
        return res.status(500).json({ error: error.message });
      }

      // Send email notification
      const durationText = duration === "permanent" 
        ? "permanently" 
        : `for ${duration} hours`;
      
      await sendEmail(
        userEmail,
        "Account Disabled - Abhikalpa",
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #000;">Account Disabled</h2>
            <p>Dear User,</p>
            <p>Your account has been disabled ${durationText}.</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            <p>If you believe this is a mistake, please contact our support team.</p>
            <p style="margin-top: 30px; color: #666;">
              Best regards,<br/>
              Abhikalpa Team
            </p>
          </div>
        `
      );

      return res.status(200).json({ 
        success: true, 
        message: `User disabled ${durationText}` 
      });

    } else if (action === "delete") {
      // Delete user permanently
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) {
        console.error("Delete user error:", error);
        return res.status(500).json({ error: error.message });
      }

      // Send email notification
      await sendEmail(
        userEmail,
        "Account Deleted - Abhikalpa",
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #000;">Account Deleted</h2>
            <p>Dear User,</p>
            <p>Your account has been permanently deleted from our system.</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            <p>All your data has been removed and cannot be recovered.</p>
            <p>If you believe this is a mistake, please contact our support team immediately.</p>
            <p style="margin-top: 30px; color: #666;">
              Best regards,<br/>
              Abhikalpa Team
            </p>
          </div>
        `
      );

      return res.status(200).json({ 
        success: true, 
        message: "User deleted permanently" 
      });

    } else {
      return res.status(400).json({ error: "Invalid action. Use 'disable' or 'delete'" });
    }

  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: err.message });
  }
}