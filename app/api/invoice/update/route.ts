import { editInvoice } from "@/app/dal";
import * as z from "zod";

const updateInvoiceBody = z.object({
  id: z.string(),
  vendorName: z.string(),
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.string(),
  total: z.string(),
  status: z.string(),
});

export async function PUT(request: Request): Promise<Response> {
  const invoice = updateInvoiceBody.parse(await request.json());

  await editInvoice(invoice);

  return new Response();
}
