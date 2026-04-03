// import { verifySession } from "@/app/dal";
import prisma from "@/app/prisma";

export async function POST(request: Request): Promise<Response> {
  const contents = await request.bytes();

  // TODO: Change PDF to detect filetype when we figure that out
  await prisma.rawInvoice.create({
    data: { contents, type: "PDF" },
  });

  return Response.json({ status: "ok" });
}
