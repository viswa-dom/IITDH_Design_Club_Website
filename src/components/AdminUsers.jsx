import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError("No session found");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch users: ${res.status}`);
      }

      const data = await res.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ADD THIS useEffect TO CALL fetchUsers ON MOUNT
  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (id, role) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch("/api/user-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId: id, role }),
      });

      if (!res.ok) throw new Error("Failed to update role");

      await fetchUsers();
    } catch (err) {
      console.error("Error updating role:", err);
      alert("Failed to update role");
    }
  };

  const disableUser = async (id) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch("/api/user-disable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId: id }),
      });

      if (!res.ok) throw new Error("Failed to disable user");

      await fetchUsers();
    } catch (err) {
      console.error("Error disabling user:", err);
      alert("Failed to disable user");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl font-light">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-light text-red-500 mb-4">Error: {error}</p>
          <button 
            onClick={fetchUsers}
            className="px-4 py-2 border border-white hover:bg-white hover:text-black transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-light mb-6">Users Management</h1>

      {users.length === 0 ? (
        <p className="text-gray-400">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white text-black rounded-sm">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b">
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 text-center">
                    {u.app_metadata?.role || "user"}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-3 justify-center flex-wrap">
                      <button
                        onClick={() => updateRole(u.id, "admin")}
                        className="px-3 py-1 border border-black hover:bg-black hover:text-white transition"
                        disabled={u.app_metadata?.role === "admin"}
                      >
                        Make Admin
                      </button>
                      <button
                        onClick={() => updateRole(u.id, "user")}
                        className="px-3 py-1 border border-black hover:bg-black hover:text-white transition"
                        disabled={u.app_metadata?.role !== "admin"}
                      >
                        Remove Admin
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Disable user ${u.email}?`)) {
                            disableUser(u.id);
                          }
                        }}
                        className="px-3 py-1 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition"
                      >
                        Disable
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}