const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export function getAuthToken(): string | null {
  return localStorage.getItem("access_token");
}

export function setAuthToken(token: string): void {
  localStorage.setItem("access_token", token);
}

export function clearAuthToken(): void {
  localStorage.removeItem("access_token");
}

export function getCurrentUsername(): string | null {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}

export function buildHeaders(includeAuth: boolean = false): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const token = getAuthToken();

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}