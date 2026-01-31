"use client";

import { useState } from "react";

export default function NovoDocumentoPage() {
  const [tipo, setTipo] = useState<"OFICIO" | "CI" | "DECLARACAO">("OFICIO");
  const [assunto, setAssunto] = useState("");
  const [destinatario, setDestinatario] = useState("");
  const [corpoHtml, setCorpoHtml] = useState("<p>Digite aqui...</p>");
  const [loading, setLoading] = useState(false);

  async function salvar() {
    setLoading(true);

    const res = await fetch("/api/documentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, assunto, destinatario, corpoHtml }),
    });

    setLoading(false);

    if (!res.ok) {
      alert("Erro ao salvar");
      return;
    }

    const doc = await res.json();
    window.location.href = `/documentos/${doc.id}`;
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold">Novo documento</h1>

        <div className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="grid gap-2">
            <label className="text-sm text-zinc-200">Tipo</label>
            <select
              className="rounded-xl bg-zinc-950/60 border border-white/10 px-4 py-3"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as any)}
            >
              <option value="OFICIO">Ofício</option>
              <option value="CI">CI</option>
              <option value="DECLARACAO">Declaração</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-zinc-200">Assunto</label>
            <input
              className="rounded-xl bg-zinc-950/60 border border-white/10 px-4 py-3"
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              placeholder="Ex: Solicitação de aquisição..."
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-zinc-200">Destinatário (opcional)</label>
            <input
              className="rounded-xl bg-zinc-950/60 border border-white/10 px-4 py-3"
              value={destinatario}
              onChange={(e) => setDestinatario(e.target.value)}
              placeholder="Ex: Setor de Compras..."
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-zinc-200">Corpo (HTML simples)</label>
            <textarea
              className="min-h-[220px] rounded-xl bg-zinc-950/60 border border-white/10 px-4 py-3 font-mono text-sm"
              value={corpoHtml}
              onChange={(e) => setCorpoHtml(e.target.value)}
            />
          </div>

          <button
            onClick={salvar}
            disabled={loading}
            className="rounded-xl bg-white text-zinc-950 font-medium py-3 disabled:opacity-60"
          >
            {loading ? "Salvando..." : "Salvar rascunho"}
          </button>
        </div>
      </div>
    </main>
  );
}
