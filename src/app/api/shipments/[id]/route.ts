import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status } = await request.json();

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json(
      { error: "Status must be APPROVED or REJECTED" },
      { status: 400 }
    );
  }

  const shipment = await prisma.shipment.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(shipment);
}
