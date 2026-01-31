import { unwrapParams } from "@/lib/params";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default async function DocumentoPage({ params }: PageProps) {
  const { id } = await unwrapParams(params);

  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const setorId = (session.user as any).setorId as string | null;
  if (!setorId) redirect("/documentos");

  const doc = await prisma.document.findFirst({
    where: { id, setorId },
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
      <h1 className="text-2xl font-bold">
        {doc.tipo} {doc.numero ?? "(Rascunho)"}
      </h1>
      {/* resto da página */}
    </main>
  );
}
