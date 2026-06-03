import { useState, type FormEvent } from "react";
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
        setErrorMessage("Falha ao fazer login");
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
        setErrorMessage("Falha ao criar conta");
      }
    } finally {
      setIsSubmitting(false);
      setSubmitMode(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Subtle background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-4">
            <span className="text-2xl">⚽</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">
            WorldCup<span className="text-emerald-400">RetireUs</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Calculador de cenários de apostas — Copa do Mundo 2026
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Usuário
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
                required
                placeholder="Digite seu usuário"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors disabled:opacity-50 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
                placeholder="Digite sua senha"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors disabled:opacity-50 text-sm"
              />
            </div>

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/25 rounded-lg px-3 py-2.5 text-red-400 text-sm">
                {errorMessage}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isSubmitting && submitMode === "login"
                  ? "Entrando..."
                  : "Entrar"}
              </button>

              <button
                type="button"
                onClick={handleSignUp}
                disabled={isSubmitting || !username || !password}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2.5 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isSubmitting && submitMode === "signup"
                  ? "Criando..."
                  : "Criar conta"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
