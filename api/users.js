// api/users.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {

  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const auth = req.headers.authorization;
    if (!auth) {
      return res.status(401).json({ error: "Missing token" });
    }

    const token = auth.replace("Bearer ", "");

    const { data: authUser, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error("Auth error:", error);
      return res.status(403).json({ error: "Invalid token" });
    }

    if (authUser.user.app_metadata?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden - Admin only" });
    }

    const { data, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error("List users error:", listError);
      return res.status(500).json({ error: listError.message });
    }

    return res.status(200).json(data.users);
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: err.message });
  }
}