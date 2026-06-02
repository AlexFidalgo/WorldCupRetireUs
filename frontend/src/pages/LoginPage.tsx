import { FormEvent, useState } from "react";
import { login, signUp } from "../api/auth";

type LoginPageProps = {
  onLoginSuccess: () => void;
};

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMode, setSubmitMode] = useState<"login" | "signup" | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitMode("login");
    setErrorMessage("");

    try {
      await login(username, password);
      onLoginSuccess();
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Login failed");
      }
    } finally {
      setIsSubmitting(false);
      setSubmitMode(null);
    }
  }

  async function handleSignUp() {
    setIsSubmitting(true);
    setSubmitMode("signup");
    setErrorMessage("");

    try {
      await signUp(username, password);
      await login(username, password);
      onLoginSuccess();
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Sign up failed");
      }
    } finally {
      setIsSubmitting(false);
      setSubmitMode(null);
    }
  }

  return (
    <main>
      <h1>WorldCupRetireUs</h1>
      <p>Login or create an account to manage betting scenarios.</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting && submitMode === "login" ? "Logging in..." : "Login"}
          </button>

          <button
            type="button"
            onClick={handleSignUp}
            disabled={isSubmitting || !username || !password}
          >
            {isSubmitting && submitMode === "signup" ? "Creating account..." : "Sign Up"}
          </button>
        </div>

        {errorMessage ? <p>{errorMessage}</p> : null}
      </form>
    </main>
  );
}