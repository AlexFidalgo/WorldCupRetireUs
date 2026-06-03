import { getApiBaseUrl, setAuthToken } from "./client";
import type { LoginResponse } from "../types/api";
import type { UserResponse } from "../types/api";

export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      username,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error("Invalid credentials");
  }

  const data: LoginResponse = await response.json();

  setAuthToken(data.access_token);

  return data;
}

export class UsernameNotAllowedError extends Error {
  available: string[];
  constructor(available: string[]) {
    super("username_not_allowed");
    this.available = available;
  }
}

export async function signUp(username: string, password: string): Promise<UserResponse> {
  const response = await fetch(`${getApiBaseUrl()}/users/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const detail = errorData?.detail;

    if (detail?.code === "username_not_allowed") {
      throw new UsernameNotAllowedError(detail.available ?? []);
    }

    throw new Error(
      typeof detail === "string" ? detail : "Falha ao criar conta",
    );
  }

  return response.json() as Promise<UserResponse>;
}