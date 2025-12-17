// api/cron-check-bans.js
// This should be called by Vercel Cron Jobs to check expired bans
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendUnbanEmail(email) {
  try {
    await transporter.sendMail({
      from: `"Abhikalpa Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Account Reactivated - Abhikalpa",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #000;">Account Reactivated</h2>
          <p>Dear User,</p>
          <p>Good news! Your temporary ban has expired and your account has been automatically reactivated.</p>
          <p>You can now log in and continue using all our services.</p>
          <p>We hope you'll follow our community guidelines going forward.</p>
          <p style="margin-top: 30px; color: #666;">
            Best regards,<br/>
            Abhikalpa Team
          </p>
        </div>
      `,
    });
    console.log(`Unban email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send unban email to ${email}:`, error);
  }
}

export default async function handler(req, res) {
  // Verify this is a cron job request (optional security measure)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Get all users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error("Error listing users:", listError);
      return res.status(500).json({ error: listError.message });
    }

    const now = new Date();
    const unbannedUsers = [];

    // Check each user for expired bans
    for (const user of users) {
      if (user.banned_until) {
        const bannedUntil = new Date(user.banned_until);
        
        // If ban has expired
        if (bannedUntil <= now) {
          // Unban the user
          const { error: unbanError } = await supabase.auth.admin.updateUserById(user.id, {
            ban_duration: "none",
          });

          if (unbanError) {
            console.error(`Failed to unban user ${user.email}:`, unbanError);
            continue;
          }

          // Send reactivation email
          await sendUnbanEmail(user.email);
          unbannedUsers.push(user.email);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: `Checked ${users.length} users, unbanned ${unbannedUsers.length}`,
      unbanned: unbannedUsers,
    });

  } catch (err) {
    console.error("Unexpected error in cron job:", err);
    return res.status(500).json({ error: err.message });
  }
}