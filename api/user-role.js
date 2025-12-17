import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { userId, role } = req.body;
  const token = req.headers.authorization?.replace("Bearer ", "");

  const { data: adminUser } = await supabase.auth.getUser(token);
  if (adminUser.user.app_metadata?.role !== "admin") {
    return res.status(403).end();
  }

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    app_metadata: { role },
  });

  if (error) return res.status(500).json({ error: error.message });

  res.json({ success: true });
}
