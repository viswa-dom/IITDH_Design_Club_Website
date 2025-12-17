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
        <p className="text-xl font-light tracking-wide">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-xl font-light text-red-500 mb-6 tracking-wide">Error: {error}</p>
          <button 
            onClick={fetchUsers}
            className="px-6 py-2 border border-white hover:bg-white hover:text-black transition-all duration-300 tracking-wide text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-16 md:px-12 lg:px-24">
      {/* Header Section - matching merch page style */}
      <div className="mb-16">
        <h1 className="text-4xl md:text-5xl font-light mb-4 tracking-wide">Users Management</h1>
        <p className="text-gray-400 font-light tracking-wide">Manage user roles and permissions</p>
      </div>

      {users.length === 0 ? (
        <p className="text-gray-400 text-center py-12 tracking-wide">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white text-black">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="p-4 text-left font-light tracking-wide">Email</th>
                <th className="p-4 text-center font-light tracking-wide">Role</th>
                <th className="p-4 text-center font-light tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                  <td className="p-4 font-light tracking-wide">{u.email}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-3 py-1 text-sm tracking-wide ${
                      u.app_metadata?.role === "admin" 
                        ? "bg-black text-white" 
                        : "bg-gray-200 text-black"
                    }`}>
                      {u.app_metadata?.role || "user"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 justify-center flex-wrap">
                      <button
                        onClick={() => updateRole(u.id, "admin")}
                        className="px-4 py-2 border border-black text-black hover:bg-black hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed text-sm tracking-wide font-light"
                        disabled={u.app_metadata?.role === "admin"}
                      >
                        Make Admin
                      </button>
                      <button
                        onClick={() => updateRole(u.id, "user")}
                        className="px-4 py-2 border border-black text-black hover:bg-black hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed text-sm tracking-wide font-light"
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
                        className="px-4 py-2 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 text-sm tracking-wide font-light"
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