"use client";

import { useState } from "react";
import { Button } from "@/src/ui/button";
import { ALL_ROLES, ROLE_LABELS } from "@/src/app/lib/permissions";
import { Loader2, UserPlus, X } from "lucide-react";

interface UserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  actorRole: string;
}

type RoleName = keyof typeof ROLE_LABELS;

function isRoleName(role: string): role is RoleName {
  return role in ROLE_LABELS;
}

export function UserForm({ onSuccess, onCancel, actorRole }: UserFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "SUBSCRIBER",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Only show roles lower than actor's role
  const availableRoles = ALL_ROLES.filter((r) => {
    if (actorRole === "SUPER_ADMIN") return true;
    if (actorRole === "ADMIN") return r !== "SUPER_ADMIN";
    return false;
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create user");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-background">
      <div className=" flex flex-col">
        {/* Header */}
        <div className="bg-card border-b border-border px-8 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">
                  Create New User
                </h1>
                <p className="text-sm font-mono text-muted-foreground">
                  Add a new user account to the system
                </p>
              </div>
              <button
                onClick={onCancel}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 px-8 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Success Message */}
            {success && (
              <div className="mb-6 px-4 py-3 bg-green-500/10 border border-green-500/20 text-green-600 text-sm rounded-lg">
                User created successfully! Redirecting...
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 px-4 py-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Basic Information Section */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
                  Basic Information
                </h2>
                <div className="flex flex-col gap-4">
                  {/* Name Field */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      The user's display name
                    </p>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Email Address <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      placeholder="john@example.com"
                      className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Used for login and notifications
                    </p>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Password <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                      placeholder="Minimum 8 characters"
                      className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Must be at least 8 characters long
                    </p>
                  </div>
                </div>
              </div>

              {/* Role Section */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
                  User Role & Permissions
                </h2>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Role <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-ring transition-colors"
                  >
                    {availableRoles.map((r) => (
                      <option key={r} value={r}>
                        {isRoleName(r) ? ROLE_LABELS[r] : r}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Determines what permissions this user will have in the system
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <UserPlus size={15} />
                  )}
                  {loading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}