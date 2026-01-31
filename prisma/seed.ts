import { Role, DocumentType } from "@prisma/client";
import { prisma } from "../lib/db";

import bcrypt from "bcryptjs";

// const prisma = new PrismaClient();

async function main() {
    const senhaAdmin = await bcrypt.hash("admin@123", 10);

    const setorSaude = await prisma.setor.create({
        data: {
            nome: "Secretaria Municial de Saúde",
            sigla: "SMS",
        },
    });

    await prisma.user.create({
        data: {
            name: "Administrador",
            email: "admin@prefeitura.local",
            password: senhaAdmin,
            role: Role.ADMIN,
            setorId: setorSaude.id,
        },
    });

    await prisma.template.create({
        data: {
            setorId: setorSaude.id,
            tipo: DocumentType.OFICIO,
            nome: "Ofício Padrão",
            conteudoHtml: `
                <div style="font-family: Arial; font-size: 12pt;">
                <h2 style="text-align:center; margin:0;">{{CABECALHO}}</h2>
                <p><strong>OFÍCIO Nº {{NUMERO}}</strong></p>
                <p><strong>Assunto:</strong> {{ASSUNTO}}</p>
                <p><strong>Destinatário:</strong> {{DESTINATARIO}}</p>
                <div style="margin-top:16px;">{{CORPO}}</div>
                <p style="margin-top:32px;">Atenciosamente,</p>
                <p>{{ASSINATURA}}</p>
                </div>
            `,
        },
    });

    const ano = new Date().getFullYear();
    await prisma.sequence.create({
        data: {
            setorId: setorSaude.id,
            tipo: DocumentType.OFICIO,
            ano,
            atual: 0,
            proximo: 1,
        },
    });

    console.log("Seed concluído:");
    console.log("- Admin: admin@prefeitura.local / admin@123");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => prisma.$disconnect());