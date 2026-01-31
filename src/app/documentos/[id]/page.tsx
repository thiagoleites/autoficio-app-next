import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function DocumentoPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const setorId = (session.user as any).setorId as string | null;
  if (!setorId) redirect("/documentos");

  const doc = await prisma.document.findFirst({
    where: {
      id: params.id,
      setorId, // garante que o usuário só veja docs do setor dele
    },
  });

  if (!doc) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-bold">Documento não encontrado</h1>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {doc.tipo} {doc.numero ?? "(Rascunho)"}
        </h1>

        {doc.status === "RASCUNHO" && (
          <form action={`/api/documentos/${doc.id}/finalizar`} method="post">
            <button
              className="rounded-md bg-emerald-600 text-white px-5 py-2 hover:bg-emerald-500 cursor-pointer"
              type="submit"
            >
              Finalizar
            </button>
          </form>
        )}
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <span className="text-sm text-zinc-500">Assunto</span>
          <p className="font-medium">{doc.assunto}</p>
        </div>

        {doc.destinatario && (
          <div>
            <span className="text-sm text-zinc-500">Destinatário</span>
            <p className="font-medium">{doc.destinatario}</p>
          </div>
        )}

        <div>
          <span className="text-sm text-zinc-500">Conteúdo</span>
          <div
            className="prose max-w-none border rounded-xl p-4 mt-1"
            dangerouslySetInnerHTML={{ __html: doc.corpoHtml }}
          />
        </div>

        <div className="text-sm text-zinc-500">
          Criado em {new Date(doc.createdAt).toLocaleString()}
        </div>
      </div>
    </main>
  );
}
