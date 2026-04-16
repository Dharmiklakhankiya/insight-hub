"use client";

import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type PropsWithChildren, useMemo, useState } from "react";

import { apiPost, clearCsrfCache } from "@/lib/client-api";

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/cases", label: "Cases" },
  { href: "/analytics", label: "Analytics" },
];

export default function ProtectedLayout({
  children,
}: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const activeRoute = useMemo(
    () => NAV_ITEMS.find((item) => pathname.startsWith(item.href))?.href,
    [pathname],
  );

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await apiPost<{ success: boolean }, Record<string, never>>(
        "/api/auth/logout",
        {},
      );
    } catch {
      // Logout should always clear local session state even if network request fails.
    } finally {
      clearCsrfCache();
      setIsLoggingOut(false);
      router.push("/login");
      router.refresh();
    }
  }

  const navContent = (
    <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
      {NAV_ITEMS.map((item) => {
        const isActive = activeRoute === item.href;

        return (
          <Button
            key={item.href}
            component={Link}
            href={item.href}
            color={isActive ? "secondary" : "inherit"}
            variant={isActive ? "contained" : "text"}
            onClick={() => setDrawerOpen(false)}
          >
            {item.label}
          </Button>
        );
      })}
    </Stack>
  );

  return (
    <Box
      className="min-h-screen"
      sx={{
        background:
          "radial-gradient(circle at 20% 10%, rgba(0,95,115,0.14), transparent 35%), radial-gradient(circle at 85% 15%, rgba(202,103,2,0.12), transparent 30%), linear-gradient(180deg, #f8f3e9 0%, #fefcf7 55%, #f1e6cf 100%)",
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backdropFilter: "blur(8px)",
          background: "rgba(248,243,233,0.88)",
          color: "text.primary",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
        }}
      >
        <Toolbar className="mx-auto w-full max-w-7xl px-4">
          <Typography variant="h6" sx={{ fontWeight: 800, flexGrow: 1 }}>
            Insight Hub
          </Typography>

          <Box
            sx={{
              display: {
                xs: "none",
                md: "block",
              },
            }}
          >
            {navContent}
          </Box>

          <Button
            color="inherit"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="ml-2"
          >
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </Button>

          <IconButton
            size="large"
            sx={{ display: { xs: "inline-flex", md: "none" }, ml: 1 }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box className="w-72 p-4">
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Navigation
          </Typography>
          {navContent}
        </Box>
      </Drawer>

      <Container maxWidth="lg" className="py-6">
        {children}
      </Container>
    </Box>
  );
}
