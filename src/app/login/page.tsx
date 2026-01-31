"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@prefeitura.local");
  const [password, setPassword] = useState("admin@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // melhor pra mostrar erro na tela
      callbackUrl: "/dashboard",
    });

    setLoading(false);

    if (!res?.ok) {
      setError("Credenciais inválidas. Verifique e tente novamente.");
      return;
    }

    // redireciona manualmente
    window.location.href = res.url ?? "/dashboard";
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/40">
          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Acessar sistema
              </h1>
              <p className="mt-1 text-sm text-zinc-300">
                Entre com suas credenciais para continuar.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-200">
                  E-mail
                </label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-white/20 focus:bg-zinc-950"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@prefeitura.local"
                  autoComplete="username"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-200">
                  Senha
                </label>
                <input
                  type="password"
                  className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-white/20 focus:bg-zinc-950"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                disabled={loading}
                type="submit"
                className="w-full rounded-xl bg-white text-zinc-950 font-medium py-3 transition hover:bg-zinc-100 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>
          </div>

          <div className="border-t border-white/10 px-8 py-4 text-xs text-zinc-400">
            Prefeitura • Gestão de Ofícios, CI e Declarações
          </div>
        </div>
      </div>
    </main>
  );
}
