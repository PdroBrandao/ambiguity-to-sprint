import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/orders-store";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const order = createOrder({
    patientId: body.patientId,
    payerOverride: body.payerOverride,
    items: body.items,
    notes: body.notes,
    status: body.status ?? "Draft",
  });
  return NextResponse.json(order, { status: 201 });
}
