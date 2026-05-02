"use client";

import { useRouter } from "next/navigation";
import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from "react";

import Sidebar from "@/components/layout/sidebar";
import ProtectedFooter from "@/components/layout/protected-footer";
import { apiGet, apiPost, clearCsrfCache } from "@/lib/client-api";
import type { User } from "@/lib/types";

export default function ProtectedLayout({ children }: PropsWithChildren) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const data = await apiGet<{ user: User }>("/api/auth/me");
      setCurrentUser(data.user);
    } catch {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  async function handleLogout() {
    try {
      await apiPost<{ success: boolean }, Record<string, never>>(
        "/api/auth/logout",
        {},
      );
    } catch {
      // Logout should always clear local session state even if network request fails.
    } finally {
      clearCsrfCache();
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Sidebar currentUser={currentUser} onLogout={handleLogout} />

      <main className="ml-64 flex-1 min-h-screen bg-surface">
        <div className="p-10">{children}</div>
      </main>

      <ProtectedFooter />
    </div>
  );
}
