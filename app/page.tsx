import { redirect } from "next/navigation";

import { getSessionFromCookies } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSessionFromCookies();
  if (session) {
    redirect("/dashboard");
  }

  redirect("/login");
}
