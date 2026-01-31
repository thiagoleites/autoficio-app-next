import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

function formatNumero(seq: number, ano: number) {
  // 000001/2026
  return `${String(seq).padStart(6, "0")}/${ano}`;
}

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("UNAUTHORIZED", { status: 401 });

  const setorId = (session.user as any).setorId as string | null;
  const userId = (session.user as any).id as string | undefined;

  if (!setorId || !userId) {
    return new NextResponse("BAD_SESSION", { status: 400 });
  }

  const docId = params.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1) Busca o documento garantindo que é do setor e está em rascunho
      const doc = await tx.document.findFirst({
        where: { id: docId, setorId },
      });

      if (!doc) {
        throw new Error("DOC_NOT_FOUND");
      }

      if (doc.status !== "RASCUNHO") {
        // já finalizado/cancelado
        throw new Error("DOC_NOT_DRAFT");
      }

      const ano = doc.ano; // já setado na criação
      const tipo = doc.tipo;

      // 2) Garante que existe uma sequência (cria se não existir)
      // Upsert pelo unique composto: (setorId, tipo, ano)
      const seq = await tx.sequence.upsert({
        where: {
          setorId_tipo_ano: { setorId, tipo, ano },
        },
        update: {},
        create: {
          setorId,
          tipo,
          ano,
          atual: 0,
          proximo: 1,
        },
      });

      const numeroGerado = formatNumero(seq.proximo, ano);

      // 3) Atualiza a sequência (incremento)
      await tx.sequence.update({
        where: { id: seq.id },
        data: {
          atual: seq.proximo,
          proximo: seq.proximo + 1,
        },
      });

      // 4) Finaliza o documento (seta número + status)
      const updated = await tx.document.update({
        where: { id: doc.id },
        data: {
          numero: numeroGerado,
          status: "FINALIZADO",
        },
      });

      // 5) Auditoria
      await tx.auditLog.create({
        data: {
          userId,
          documentId: updated.id,
          action: "FINALIZE",
          metadata: { numero: numeroGerado, tipo, ano },
        },
      });

      return updated;
    });

    // redireciona de volta para a página do documento
    return NextResponse.redirect(
      new URL(`/documentos/${result.id}`, process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
      { status: 303 }
    );
  } catch (e: any) {
    const msg = String(e?.message || "");

    if (msg === "DOC_NOT_FOUND") {
      return new NextResponse("NOT_FOUND", { status: 404 });
    }
    if (msg === "DOC_NOT_DRAFT") {
      return new NextResponse("DOCUMENT_NOT_DRAFT", { status: 409 });
    }

    console.error(e);
    return new NextResponse("INTERNAL_ERROR", { status: 500 });
  }
}
