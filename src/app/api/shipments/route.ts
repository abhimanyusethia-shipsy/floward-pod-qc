import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where = status ? { status } : {};
  const shipments = await prisma.shipment.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const counts = {
    YET_TO_BE_DELIVERED: await prisma.shipment.count({ where: { status: "YET_TO_BE_DELIVERED" } }),
    DELIVERED: await prisma.shipment.count({ where: { status: "DELIVERED" } }),
    APPROVED: await prisma.shipment.count({ where: { status: "APPROVED" } }),
    REJECTED: await prisma.shipment.count({ where: { status: "REJECTED" } }),
  };

  return NextResponse.json({ shipments, counts });
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const shipmentId = formData.get("shipmentId") as string;
  const productName = formData.get("productName") as string;
  const amount = parseFloat(formData.get("amount") as string) || 0;
  const qcImage = formData.get("qcImage") as File;

  if (!shipmentId || !productName || !qcImage) {
    return NextResponse.json(
      { error: "shipmentId, productName, and qcImage are required" },
      { status: 400 }
    );
  }

  const bytes = await qcImage.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `QC_${shipmentId}_${Date.now()}.jpeg`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), buffer);

  const shipment = await prisma.shipment.create({
    data: {
      shipmentId,
      productName,
      amount,
      qcImagePath: `/uploads/${filename}`,
    },
  });

  return NextResponse.json(shipment, { status: 201 });
}
