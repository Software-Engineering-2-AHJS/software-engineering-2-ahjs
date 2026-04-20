type GeminiInvoiceExtraction = {
  vendorName: string | null;
  businessID: string | null;
  invoiceNumber: string | null;
  subtotalAmount: number | null;
  vatAmount: number | null;
  totalAmount: number | null;
  vatRate: number | null;
};

const DEFAULT_MODEL = "gemini-2.5-flash";

function extractJsonBlock(text: string): string {
  const trimmed = text.trim();

  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  return trimmed;
}

function parseNullableNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

function parseNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeExtraction(payload: unknown): GeminiInvoiceExtraction {
  const record = payload && typeof payload === "object" ? payload : {};

  return {
    vendorName: parseNullableString((record as Record<string, unknown>).vendorName),
    businessID: parseNullableString((record as Record<string, unknown>).businessID),
    invoiceNumber: parseNullableString(
      (record as Record<string, unknown>).invoiceNumber,
    ),
    subtotalAmount: parseNullableNumber(
      (record as Record<string, unknown>).subtotalAmount,
    ),
    vatAmount: parseNullableNumber((record as Record<string, unknown>).vatAmount),
    totalAmount: parseNullableNumber((record as Record<string, unknown>).totalAmount),
    vatRate: parseNullableNumber((record as Record<string, unknown>).vatRate),
  };
}

export async function extractInvoiceFieldsFromPdf(
  pdfBytes: Uint8Array<ArrayBuffer>,
): Promise<GeminiInvoiceExtraction> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const prompt = [
    "Extract invoice data from this PDF.",
    "Return JSON only.",
    "Use null for missing values.",
    "Extract only these fields:",
    "vendorName: invoice sender name",
    "businessID: sender business ID",
    "invoiceNumber: invoice number",
    "subtotalAmount: amount excluding VAT",
    "vatAmount: VAT amount",
    "vatRate: VAT percentage as a number",
    "totalAmount: total invoice amount",
    "Allowed JSON keys:",
    "vendorName, businessID, invoiceNumber, subtotalAmount, vatAmount, vatRate, totalAmount",
  ].join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: "application/pdf",
                  data: Buffer.from(pdfBytes).toString("base64"),
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  const text = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return normalizeExtraction(JSON.parse(extractJsonBlock(text)));
}

export type { GeminiInvoiceExtraction };