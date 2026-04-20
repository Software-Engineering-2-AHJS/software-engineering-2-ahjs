import { extractInvoiceFieldsFromPdf } from "@/app/lib/gemini";

export async function POST(request: Request): Promise<Response> {
  const contents = await request.bytes();
  const contentType = request.headers.get("content-type");

  if (contentType !== null && !contentType.includes("application/pdf")) {
    return Response.json(
      { error: "Only application/pdf uploads are supported" },
      { status: 415 },
    );
  }

  if (contents.length === 0) {
    return Response.json({ error: "Request body is empty" }, { status: 400 });
  }

  try {
    const extracted = await extractInvoiceFieldsFromPdf(contents);
    return Response.json({ status: "ok", extracted });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invoice extraction failed";

    return Response.json({ error: message }, { status: 502 });
  }
}

export async function GET(): Promise<Response> {
  return Response.json({
    status: "ok",
    message: "POST a PDF with Content-Type: application/pdf to extract fields.",
  });
}