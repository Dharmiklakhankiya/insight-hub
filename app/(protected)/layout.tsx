import { type PropsWithChildren } from "react";

import ProtectedLayout from "@/components/protected-layout";

export default function ProtectedRouteLayout({ children }: PropsWithChildren) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
