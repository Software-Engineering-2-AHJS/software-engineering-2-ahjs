// import { verifySession } from "@/app/dal";
import prisma from "@/app/prisma";

function doOCRStuff(rawInvoice: Uint8Array<ArrayBuffer>): object {
  return {};
}

export async function POST(request: Request): Promise<Response> {
  const contents = await request.bytes();

  // TODO: Change PDF to detect filetype when we figure that out
  await prisma.rawInvoice.create({
    data: { contents, type: "PDF" },
  });

  // save the data in database with prisma from result of doOCRStuff() on invoice
  const ocrData = doOCRStuff(contents);

  return Response.json({ status: "ok" });
}

export async function GET(): Promise<Response> {
  const invoices = await prisma.invoice.findMany({ take: 10 });

  return Response.json(invoices);
}
