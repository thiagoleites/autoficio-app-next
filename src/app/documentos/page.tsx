import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function DocumentosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const setorId = (session.user as any).setorId as string | null;
  if (!setorId) redirect("/dashboard");

  const docs = await prisma.document.findMany({
    where: { setorId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Documentos</h1>
        <Link
          href="/documentos/novo"
          className="rounded-xl bg-black text-white px-4 py-2 hover:opacity-90"
        >
          Novo
        </Link>
      </div>

      <div className="mt-6 space-y-2">
        {docs.map((d) => (
          <Link
            key={d.id}
            href={`/documentos/${d.id}`}
            className="block rounded-xl border p-4 hover:bg-zinc-50"
          >
            <div className="flex items-center justify-between">
              <div className="font-medium">
                [{d.tipo}] {d.numero ?? "RASCUNHO"} — {d.assunto}
              </div>
              <div className="text-sm text-zinc-500">{d.status}</div>
            </div>
          </Link>
        ))}

        {docs.length === 0 && (
          <div className="text-zinc-500 mt-8">Nenhum documento ainda.</div>
        )}
      </div>
    </main>
  );
}
