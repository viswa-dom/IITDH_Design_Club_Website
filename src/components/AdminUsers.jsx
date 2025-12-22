import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [duration, setDuration] = useState("24");
  const [reason, setReason] = useState("");

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
    document.title = "Admin Users Management - Abhikalpa";
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

  const openModal = (action, user) => {
    setModalAction(action);
    setSelectedUser(user);
    setShowModal(true);
    setDuration("24");
    setReason("");
  };

  const handleAction = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert("No session found. Please log in again.");
        return;
      }

      const body = {
        userId: selectedUser.id,
        action: modalAction,
        reason: reason.trim() || undefined,
      };

      if (modalAction === "disable") {
        body.duration = duration === "permanent" ? "permanent" : parseInt(duration);
      }

      const res = await fetch("/api/user-disable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${modalAction} user`);
      }

      setShowModal(false);
      await fetchUsers();
      alert(`User ${modalAction === "unban" ? "unbanned" : modalAction + "d"} successfully`);
    } catch (err) {
      console.error(`Error ${modalAction}ing user:`, err);
      alert(`Failed to ${modalAction} user: ${err.message}`);
    }
  };

  const handleUnban = async (user) => {
    if (!confirm(`Unban user ${user.email}?`)) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch("/api/user-disable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          action: "unban",
        }),
      });

      if (!res.ok) throw new Error("Failed to unban user");

      await fetchUsers();
      alert("User unbanned successfully");
    } catch (err) {
      console.error("Error unbanning user:", err);
      alert("Failed to unban user");
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
      {/* Header Section */}
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
                <th className="p-4 text-center font-light tracking-wide">Status</th>
                <th className="p-4 text-center font-light tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const isBanned = u.banned_until && new Date(u.banned_until) > new Date();
                
                return (
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
                    <td className="p-4 text-center">
                      {isBanned ? (
                        <span className="inline-block px-3 py-1 text-sm tracking-wide bg-red-100 text-red-600">
                          Banned
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 text-sm tracking-wide bg-green-100 text-green-600">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-center flex-wrap">
                        {!isBanned && (
                          <>
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
                              onClick={() => openModal("disable", u)}
                              className="px-4 py-2 border border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white transition-all duration-300 text-sm tracking-wide font-light"
                            >
                              Disable
                            </button>
                            <button
                              onClick={() => openModal("delete", u)}
                              className="px-4 py-2 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 text-sm tracking-wide font-light"
                            >
                              Delete
                            </button>
                          </>
                        )}
                        {isBanned && (
                          <>
                            <button
                              onClick={() => handleUnban(u)}
                              className="px-4 py-2 border border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-all duration-300 text-sm tracking-wide font-light"
                            >
                              Unban
                            </button>
                            <button
                              onClick={() => openModal("delete", u)}
                              className="px-4 py-2 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 text-sm tracking-wide font-light"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 px-4">
          <div className="bg-white text-black p-8 max-w-md w-full">
            <h2 className="text-2xl font-light mb-6 tracking-wide">
              {modalAction === "disable" ? "Disable User" : "Delete User"}
            </h2>
            
            <p className="mb-4 font-light">
              User: <strong>{selectedUser?.email}</strong>
            </p>

            {modalAction === "disable" && (
              <div className="mb-4">
                <label className="block mb-2 font-light tracking-wide">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-2 border border-gray-300 font-light"
                >
                  <option value="1">1 hour</option>
                  <option value="6">6 hours</option>
                  <option value="24">24 hours</option>
                  <option value="168">1 week</option>
                  <option value="720">1 month</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
            )}

            <div className="mb-6">
              <label className="block mb-2 font-light tracking-wide">
                Reason (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 border border-gray-300 font-light"
                rows="3"
                placeholder="Explain why this action is being taken..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAction}
                className={`flex-1 px-4 py-2 ${
                  modalAction === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-orange-600 hover:bg-orange-700"
                } text-white transition-all duration-300 tracking-wide font-light`}
              >
                Confirm {modalAction === "disable" ? "Disable" : "Delete"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-black hover:bg-black hover:text-white transition-all duration-300 tracking-wide font-light"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}