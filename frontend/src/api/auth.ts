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

export async function signUp(username: string, password: string): Promise<UserResponse> {
  const response = await fetch(`${getApiBaseUrl()}/users/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message =
      errorData?.detail ?? "Failed to create user";

    throw new Error(message);
  }

  const data: UserResponse = await response.json();

  return data;
}