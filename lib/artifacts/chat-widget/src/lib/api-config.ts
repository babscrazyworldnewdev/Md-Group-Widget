import { setBaseUrl } from "@workspace/api-client-react";

const API_URL_PARAM = "apiUrl";

export function getApiBaseUrl(): string | null {
  const value = new URLSearchParams(window.location.search).get(API_URL_PARAM);
  if (!value) return null;

  try {
    return new URL(value).href.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

export function resolveApiPath(path: string): string {
  const baseUrl = getApiBaseUrl();
  return baseUrl ? `${baseUrl}${path}` : path;
}

export function configureApiBaseUrl(): void {
  setBaseUrl(getApiBaseUrl());
}
