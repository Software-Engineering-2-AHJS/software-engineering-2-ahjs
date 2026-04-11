import "server-only";

import { auth } from "@/app/auth";
import prisma from "@/app/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import type { Prisma } from "@/app/generated/prisma/client";

export const editInvoice = async ({
  id,
  vendorName,
  type,
  amount,
  total,
  status,
}: {
  id: string;
  vendorName: string;
  type: "INCOME" | "EXPENSE";
  amount: string;
  total: string;
  status: string;
}) => {
  await prisma.invoice.update({
    where: { id: id },
    data: {
      vendorName,
      type,
      subtotalAmount: amount,
      totalAmount: total,
      status,
    },
  });
};

/** DB shape for fields OCR / confirmation writes (matches `prisma/schema.prisma` Invoice). */
export type InvoiceOcrFieldRow = {
  type: "INCOME" | "EXPENSE" | null;
  category: string | null;
  vendorName: string | null;
  businessID: string | null;
  vendorVATNumber: string | null;
  invoiceNumber: string | null;
  referenceNumber: string | null;
  invoiceDate: Date | null;
  dueDate: Date | null;
  paymentTermsDays: number | null;
  iban: string | null;
  bic: string | null;
  billingName: string | null;
  billingAddress: string | null;
  billingPostalCode: string | null;
  billingCity: string | null;
  billingCountry: string | null;
  deliveryDate: string | null;
  subtotalAmount: unknown;
  taxAmount: unknown;
  totalAmount: unknown;
  vatRate: unknown;
  currency: string;
  notes: string | null;
  paidDate: Date | null;
};

/** Finnish / EU invoice fields that OCR (or user confirmation) fills */
export type OcrExtractedInvoiceFields = {
  type: "INCOME" | "EXPENSE" | null;
  category: string | null;
  vendorName: string | null;
  businessID: string | null;
  vendorVATNumber: string | null;
  invoiceNumber: string | null;
  referenceNumber: string | null;
  invoiceDate: string | null;
  dueDate: string | null;
  paymentTermsDays: number | null;
  iban: string | null;
  bic: string | null;
  billingName: string | null;
  billingAddress: string | null;
  billingPostalCode: string | null;
  billingCity: string | null;
  billingCountry: string | null;
  deliveryDate: string | null;
  subtotalAmount: string | null;
  taxAmount: string | null;
  totalAmount: string | null;
  vatRate: string | null;
  currency: string;
  notes: string | null;
  paidDate: string | null;
};

/** Single invoice for OCR review UI (JSON-safe; no binary) */
export type InvoiceOcrReviewDto = {
  id: string;
  userId: string;
  status: string | null;
  rawInvoiceId: string;
  rawInvoice: {
    id: string;
    type: string;
  };
  extracted: OcrExtractedInvoiceFields;
  rawOcrData: unknown;
  createdAt: string;
  updatedAt: string;
};

/** Minimal row for accountant task lists */
export type AccountantQueueInvoiceItem = {
  id: string;
  status: string | null;
  vendorName: string | null;
  businessID: string | null;
  referenceNumber: string | null;
  createdAt: string;
};

export type AccountantClientWithQueue = {
  id: string;
  name: string;
  invoices: AccountantQueueInvoiceItem[];
};

export const verifySession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session === null) {
    redirect("/login");
  }

  return { isAuth: true as const, userId: session.user.id };
});

function toIso(d: Date | null | undefined): string | null {
  if (!d) return null;
  return d.toISOString();
}

function decimalToString(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "object" && v !== null && "toString" in v) {
    const t = (v as { toString(): string }).toString();
    return typeof t === "string" ? t : String(v);
  }
  return String(v);
}

function mapInvoiceRowToExtracted(
  row: InvoiceOcrFieldRow,
): OcrExtractedInvoiceFields {
  const t = row.type;
  return {
    type: t === "INCOME" || t === "EXPENSE" ? t : null,
    category: row.category ?? null,
    vendorName: row.vendorName ?? null,
    businessID: row.businessID ?? null,
    vendorVATNumber: row.vendorVATNumber ?? null,
    invoiceNumber: row.invoiceNumber ?? null,
    referenceNumber: row.referenceNumber ?? null,
    invoiceDate: toIso(row.invoiceDate),
    dueDate: toIso(row.dueDate),
    paymentTermsDays: row.paymentTermsDays ?? null,
    iban: row.iban ?? null,
    bic: row.bic ?? null,
    billingName: row.billingName ?? null,
    billingAddress: row.billingAddress ?? null,
    billingPostalCode: row.billingPostalCode ?? null,
    billingCity: row.billingCity ?? null,
    billingCountry: row.billingCountry ?? null,
    deliveryDate: row.deliveryDate ?? null,
    subtotalAmount: decimalToString(row.subtotalAmount),
    taxAmount: decimalToString(row.taxAmount),
    totalAmount: decimalToString(row.totalAmount),
    vatRate: decimalToString(row.vatRate),
    currency: typeof row.currency === "string" ? row.currency : "EUR",
    notes: row.notes ?? null,
    paidDate: toIso(row.paidDate),
  };
}

export type InvoiceOcrReviewDbRow = InvoiceOcrFieldRow & {
  id: string;
  userId: string;
  status: string | null;
  rawInvoiceId: string;
  rawOcrData: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
  rawInvoice: { id: string; type: string };
};

/** Map DB row → review DTO (use after findFirst/findUnique with rawInvoice include). */
export function toInvoiceOcrReviewDto(
  row: InvoiceOcrReviewDbRow,
): InvoiceOcrReviewDto {
  return {
    id: row.id,
    userId: row.userId,
    status: row.status,
    rawInvoiceId: row.rawInvoiceId,
    rawInvoice: {
      id: row.rawInvoice.id,
      type: row.rawInvoice.type,
    },
    extracted: mapInvoiceRowToExtracted(row),
    rawOcrData: row.rawOcrData ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapQueueInvoice(row: {
  id: string;
  status: string | null;
  vendorName: string | null;
  businessID: string | null;
  referenceNumber: string | null;
  createdAt: Date;
}): AccountantQueueInvoiceItem {
  return {
    id: row.id,
    status: row.status,
    vendorName: row.vendorName,
    businessID: row.businessID,
    referenceNumber: row.referenceNumber,
    createdAt: row.createdAt.toISOString(),
  };
}

const invoiceOcrReviewSelect = {
  id: true,
  userId: true,
  status: true,
  rawInvoiceId: true,
  rawOcrData: true,
  type: true,
  category: true,
  vendorName: true,
  businessID: true,
  vendorVATNumber: true,
  invoiceNumber: true,
  referenceNumber: true,
  invoiceDate: true,
  dueDate: true,
  paymentTermsDays: true,
  iban: true,
  bic: true,
  billingName: true,
  billingAddress: true,
  billingPostalCode: true,
  billingCity: true,
  billingCountry: true,
  deliveryDate: true,
  subtotalAmount: true,
  taxAmount: true,
  totalAmount: true,
  vatRate: true,
  currency: true,
  notes: true,
  paidDate: true,
  createdAt: true,
  updatedAt: true,
  rawInvoice: { select: { id: true, type: true } },
} as const;

/**
 * Load one invoice for the current user and return a JSON-safe OCR review object.
 */
export const getInvoiceById = cache(
  async (invoiceId: string): Promise<InvoiceOcrReviewDto | null> => {
    const { userId } = await verifySession();

    const row = await prisma.invoice.findFirst({
      where: { id: invoiceId, userId },
      select: invoiceOcrReviewSelect,
    });

    if (!row) return null;
    return toInvoiceOcrReviewDto(row as InvoiceOcrReviewDbRow);
  },
);

/**
 * Accountant: clients with invoices that need action (processing / review).
 */
export const getAccountantTaskQueue = cache(
  async (): Promise<AccountantClientWithQueue[]> => {
    const { userId: accountantId } = await verifySession();

    const data = await prisma.user.findUnique({
      where: { id: accountantId },
      select: {
        clients: {
          select: {
            id: true,
            name: true,
            invoices: {
              where: {
                status: { in: ["PROCESSING", "READY_FOR_REVIEW"] },
              },
              orderBy: { createdAt: "asc" },
              select: {
                id: true,
                status: true,
                vendorName: true,
                businessID: true,
                referenceNumber: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!data?.clients?.length) return [];

    type ClientRow = {
      id: string;
      name: string;
      invoices: {
        id: string;
        status: string | null;
        vendorName: string | null;
        businessID: string | null;
        referenceNumber: string | null;
        createdAt: Date;
      }[];
    };

    return (data.clients as ClientRow[]).map((c) => ({
      id: c.id,
      name: c.name,
      invoices: c.invoices.map(mapQueueInvoice),
    }));
  },
);
