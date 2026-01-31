import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { chromium } from "playwright";

function wrapHtml(title: string, bodyHtml: string) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    @page { size: A4; margin: 18mm 15mm; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 12pt; color: #111; }
    h1 { font-size: 16pt; margin: 0 0 12px; }
    .meta { margin: 0 0 10px; font-size: 10.5pt; color: #333; }
    .box { border: 1px solid #ddd; padding: 10px 12px; border-radius: 8px; }
    .hr { height: 1px; background: #e5e5e5; margin: 12px 0; }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("UNAUTHORIZED", { status: 401 });

  const setorId = (session.user as any).setorId as string | null;
  if (!setorId) return new NextResponse("SETOR_NOT_FOUND", { status: 400 });

  const doc = await prisma.document.findFirst({
    where: { id: params.id, setorId },
    include: { setor: true, autor: true },
  });

  if (!doc) return new NextResponse("NOT_FOUND", { status: 404 });

  // (MVP) HTML simples. Depois a gente aplica Template do setor + cabeçalho.
  const title = `${doc.tipo} ${doc.numero ?? ""}`.trim();

  const bodyHtml = `
    <h1>${doc.tipo} ${doc.numero ? `Nº ${doc.numero}` : "(Rascunho)"}</h1>
    <p class="meta"><strong>Setor:</strong> ${doc.setor.nome}${doc.setor.sigla ? ` (${doc.setor.sigla})` : ""}</p>
    <p class="meta"><strong>Assunto:</strong> ${doc.assunto}</p>
    ${doc.destinatario ? `<p class="meta"><strong>Destinatário:</strong> ${doc.destinatario}</p>` : ""}
    <div class="hr"></div>
    <div class="box">
      ${doc.corpoHtml}
    </div>
    <div class="hr"></div>
    <p class="meta"><strong>Gerado por:</strong> ${doc.autor.name ?? doc.autor.email}</p>
    <p class="meta"><strong>Data:</strong> ${new Date(doc.updatedAt).toLocaleString("pt-BR")}</p>
  `;

  const html = wrapHtml(title, bodyHtml);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  const filenameBase = `${doc.tipo}-${doc.numero ?? doc.id}`.replace(/[^\w\-\/]/g, "_");

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filenameBase}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
