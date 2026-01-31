import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const CreateSchema = z.object({
  tipo: z.enum(["OFICIO", "CI", "DECLARACAO"]),
  assunto: z.string().min(3),
  destinatario: z.string().optional(),
  corpoHtml: z.string().min(3),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("UNAUTHORIZED", { status: 401 });

  // se você já está salvando setorId na session, pega ele aqui:
  const setorId = (session.user as any).setorId as string | null;
  if (!setorId) return new NextResponse("SETOR_NOT_FOUND", { status: 400 });

  const docs = await prisma.document.findMany({
    where: { setorId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(docs);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("UNAUTHORIZED", { status: 401 });

  const setorId = (session.user as any).setorId as string | null;
  const autorId = (session.user as any).id as string | undefined;

  if (!setorId || !autorId) return new NextResponse("BAD_SESSION", { status: 400 });

  const body = await req.json();
  const data = CreateSchema.parse(body);

  const ano = new Date().getFullYear();

  const doc = await prisma.document.create({
    data: {
      setorId,
      autorId,
      tipo: data.tipo,
      ano,
      assunto: data.assunto,
      destinatario: data.destinatario,
      corpoHtml: data.corpoHtml,
      status: "RASCUNHO",
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: autorId,
      documentId: doc.id,
      action: "CREATE_DRAFT",
      metadata: { tipo: doc.tipo },
    },
  });

  return NextResponse.json(doc, { status: 201 });
}
