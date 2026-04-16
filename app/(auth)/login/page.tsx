"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { ZodError } from "zod";

import { apiPost } from "@/lib/client-api";
import type { User } from "@/lib/types";
import { loginSchema, registerSchema } from "@/lib/validators/auth.schema";

type Mode = "login" | "register";

type LoginFormState = {
  email: string;
  password: string;
};

type RegisterFormState = {
  name: string;
  email: string;
  password: string;
  role: "admin" | "lawyer" | "clerk";
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

  const [mode, setMode] = useState<Mode>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [loginForm, setLoginForm] = useState<LoginFormState>({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState<RegisterFormState>({
    name: "",
    email: "",
    password: "",
    role: "clerk",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const parsed = loginSchema.safeParse(loginForm);
        if (!parsed.success) {
          setFieldErrors(mapZodErrors(parsed.error));
          return;
        }

        await apiPost<{ user: User }, LoginFormState>(
          "/api/auth/login",
          parsed.data,
        );
      } else {
        const parsed = registerSchema.safeParse(registerForm);
        if (!parsed.success) {
          setFieldErrors(mapZodErrors(parsed.error));
          return;
        }

        await apiPost<{ user: User }, RegisterFormState>(
          "/api/auth/register",
          parsed.data,
        );
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setApiError("Authentication failed. Check your credentials and try again.");
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
            "linear-gradient(130deg, rgba(0,95,115,0.95) 0%, rgba(10,147,150,0.84) 55%, rgba(202,103,2,0.9) 100%)",
          color: "white",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Insight Hub
        </Typography>
        <Typography sx={{ opacity: 0.92, mt: 1 }}>
          Legal intelligence, case operations, and analytics in one secure workspace.
        </Typography>
      </Box>

      <CardContent className="p-6">
        <Tabs
          value={mode}
          onChange={(_event, value: Mode) => {
            setMode(value);
            setFieldErrors({});
            setApiError(null);
          }}
          sx={{ mb: 3 }}
        >
          <Tab value="login" label="Sign in" />
          <Tab value="register" label="Create account" />
        </Tabs>

        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          {apiError ? <Alert severity="error">{apiError}</Alert> : null}

          {mode === "register" ? (
            <>
              <TextField
                label="Full Name"
                value={registerForm.name}
                onChange={(event) =>
                  setRegisterForm((prev) => ({ ...prev, name: event.target.value }))
                }
                error={Boolean(fieldErrors.name)}
                helperText={fieldErrors.name}
                required
                fullWidth
              />

              <TextField
                label="Email"
                type="email"
                value={registerForm.email}
                onChange={(event) =>
                  setRegisterForm((prev) => ({ ...prev, email: event.target.value }))
                }
                error={Boolean(fieldErrors.email)}
                helperText={fieldErrors.email}
                required
                fullWidth
              />

              <TextField
                label="Password"
                type="password"
                value={registerForm.password}
                onChange={(event) =>
                  setRegisterForm((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                error={Boolean(fieldErrors.password)}
                helperText={fieldErrors.password}
                required
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  label="Role"
                  value={registerForm.role}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({
                      ...prev,
                      role: event.target.value as RegisterFormState["role"],
                    }))
                  }
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="lawyer">Lawyer</MenuItem>
                  <MenuItem value="clerk">Clerk</MenuItem>
                </Select>
              </FormControl>
            </>
          ) : (
            <>
              <TextField
                label="Email"
                type="email"
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm((prev) => ({ ...prev, email: event.target.value }))
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
                  setLoginForm((prev) => ({ ...prev, password: event.target.value }))
                }
                error={Boolean(fieldErrors.password)}
                helperText={fieldErrors.password}
                required
                fullWidth
              />
            </>
          )}

          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
            {isSubmitting
              ? "Please wait..."
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </Button>

          <Divider />

          <Typography variant="body2" color="text.secondary">
            This system enforces strict validation, CSRF checks, secure cookies, and role-based access.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
