"use client";

import axios, { type AxiosRequestConfig } from "axios";

import { CSRF_HEADER_NAME } from "@/lib/constants";

const api = axios.create({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let csrfTokenCache: string | null = null;

async function fetchCsrfToken(): Promise<string> {
  if (csrfTokenCache) {
    return csrfTokenCache;
  }

  const response = await api.get<{ csrfToken: string }>("/api/csrf");
  csrfTokenCache = response.data.csrfToken;
  return csrfTokenCache;
}

export function clearCsrfCache(): void {
  csrfTokenCache = null;
}

export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.get<T>(url, config);
  return response.data;
}

export async function apiPost<T, B = unknown>(
  url: string,
  body: B,
  config?: AxiosRequestConfig,
): Promise<T> {
  const csrfToken = await fetchCsrfToken();
  const response = await api.post<T>(url, body, {
    ...config,
    headers: {
      ...(config?.headers ?? {}),
      [CSRF_HEADER_NAME]: csrfToken,
    },
  });

  return response.data;
}

export async function apiPatch<T, B = unknown>(
  url: string,
  body: B,
  config?: AxiosRequestConfig,
): Promise<T> {
  const csrfToken = await fetchCsrfToken();
  const response = await api.patch<T>(url, body, {
    ...config,
    headers: {
      ...(config?.headers ?? {}),
      [CSRF_HEADER_NAME]: csrfToken,
    },
  });

  return response.data;
}

export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const csrfToken = await fetchCsrfToken();
  const response = await api.delete<T>(url, {
    ...config,
    headers: {
      ...(config?.headers ?? {}),
      [CSRF_HEADER_NAME]: csrfToken,
    },
  });

  return response.data;
}

export async function apiUpload<T>(
  url: string,
  formData: FormData,
  config?: AxiosRequestConfig,
): Promise<T> {
  const csrfToken = await fetchCsrfToken();
  const response = await api.post<T>(url, formData, {
    ...config,
    headers: {
      ...(config?.headers ?? {}),
      "Content-Type": "multipart/form-data",
      [CSRF_HEADER_NAME]: csrfToken,
    },
  });

  return response.data;
}
