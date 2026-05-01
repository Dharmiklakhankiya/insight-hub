"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { ZodError } from "zod";

import { apiPost } from "@/lib/client-api";
import type { User } from "@/lib/types";
import { loginSchema } from "@/lib/validators/auth.schema";

type LoginFormState = {
  email: string;
  password: string;
};

function mapZodErrors(error: ZodError): Record<string, string> {
  return error.issues.reduce<Record<string, string>>((acc, issue) => {
    const key = issue.path[0] ? String(issue.path[0]) : "root";
    if (!acc[key]) {
      acc[key] = issue.message;
    }
    return acc;
  }, {});
}

export default function LoginPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState("/dashboard");

  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get("next");
    if (next && next.startsWith("/")) {
      setNextPath(next);
    }
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [loginForm, setLoginForm] = useState<LoginFormState>({
    email: "",
    password: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const parsed = loginSchema.safeParse(loginForm);
      if (!parsed.success) {
        setFieldErrors(mapZodErrors(parsed.error));
        return;
      }

      await apiPost<{ user: User }, LoginFormState>(
        "/api/auth/login",
        parsed.data,
      );

      router.push(nextPath);
      router.refresh();
    } catch {
      setApiError(
        "Authentication failed. Check your credentials and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid rgba(0,0,0,0.09)",
        overflow: "hidden",
      }}
    >
      <Box
        className="px-6 py-8"
        sx={{
          background:
            "linear-gradient(130deg, rgba(0,10,30,1) 0%, rgba(0,33,71,1) 100%)",
          color: "white",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Insight Hub
        </Typography>
        <Typography sx={{ opacity: 0.92, mt: 1 }}>
          Legal intelligence, case operations, and analytics in one secure
          workspace.
        </Typography>
      </Box>

      <CardContent className="p-6">
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
          Sign in to your account
        </Typography>

        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          {apiError ? <Alert severity="error">{apiError}</Alert> : null}

          <TextField
            label="Email"
            type="email"
            value={loginForm.email}
            onChange={(event) =>
              setLoginForm((prev) => ({
                ...prev,
                email: event.target.value,
              }))
            }
            error={Boolean(fieldErrors.email)}
            helperText={fieldErrors.email}
            required
            fullWidth
          />

          <TextField
            label="Password"
            type="password"
            value={loginForm.password}
            onChange={(event) =>
              setLoginForm((prev) => ({
                ...prev,
                password: event.target.value,
              }))
            }
            error={Boolean(fieldErrors.password)}
            helperText={fieldErrors.password}
            required
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>

          <Divider />

          <Typography variant="body2" color="text.secondary">
            User accounts are managed by your organization administrator.
            Contact your admin if you need access.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
