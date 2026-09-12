"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { Profile } from "@/lib/types";
import { PageHead, Badge, EmptyState, SkeletonRows, MigrateBadge, timeAgo } from "@/components/admin/ui";
import { IconShield } from "@/components/admin/icons";

export default function UsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrated, setMigrated] = useState<boolean | null>(null);
  const [me, setMe] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setMe(user?.id ?? null);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) setMigrated(false);
      else setMigrated(true);
      setProfiles((data ?? []) as Profile[]);
      setLoading(false);
    })();
  }, []);

  const setRole = async (p: Profile, role: Profile["role"]) => {
    const { error } = await supabase.from("profiles").update({ role }).eq("user_id", p.user_id);
    if (error) {
      toast.error(error.message.includes("policy") ? "Only admins can change roles." : error.message);
      return;
    }
    setProfiles((prev) => prev.map((x) => (x.user_id === p.user_id ? { ...x, role } : x)));
    await supabase.from("activity_logs").insert({ action: `set role ${role}`, entity_type: "profile", entity_title: p.email });
    toast.success("Role updated");
  };

  return (
    <>
      <PageHead
        title="Users"
        sub="Who can enter the control center"
        actions={<Badge value="admin writes only" />}
      />

      {migrated === false && <MigrateBadge />}

      <div className="ac-card" style={{ maxWidth: 760 }}>
        {loading ? (
          <SkeletonRows rows={5} cols={4} />
        ) : profiles.length === 0 ? (
          <EmptyState
            icon={<IconShield size={26} />}
            title="No profiles yet"
            sub="After the migration runs, create a profile for yourself with: UPDATE public.profiles SET role='admin' WHERE user_id = …"
          />
        ) : (
          <div>
            {profiles.map((p) => (
              <div
                key={p.user_id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.9rem",
                  padding: "0.9rem 1.25rem",
                  borderBottom: "1px solid var(--aline-soft)",
                }}
              >
                <div className="ash-avatar" style={{ background: p.user_id === me ? "var(--ablue)" : "var(--ablue-deep)" }}>
                  {(p.email || "?").slice(0, 1).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.86rem" }}>
                    {p.full_name || p.email}
                    {p.user_id === me && <span style={{ color: "var(--aslate)", fontWeight: 500 }}> (you)</span>}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--aslate)" }}>
                    {p.email} · joined {timeAgo(p.created_at)}
                  </div>
                </div>
                <Badge value={p.role} />
                <select
                  className="ac-select"
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", width: "auto" }}
                  value={p.role}
                  onChange={(e) => setRole(p, e.target.value as Profile["role"])}
                  disabled={p.user_id === me}
                  title={p.user_id === me ? "You cannot change your own role" : "Change role"}
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
            ))}
            <div className="ac-pager">
              <span>
                Adding new people: create the account in Supabase Auth first — the trigger then adds their profile row here.
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}