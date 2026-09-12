import "../../css/admin.css";
import AdminShell from "@/components/admin/AdminShell";
import { getProfile } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getProfile();

  const profile = session?.profile ?? {
    email: "",
    full_name: null as string | null,
    role: "",
    avatar_url: null as string | null,
  };

  return <AdminShell profile={profile}>{children}</AdminShell>;
}