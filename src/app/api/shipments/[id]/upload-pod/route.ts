import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeShipmentImages } from "@/lib/gemini";
import path from "path";
import fs from "fs/promises";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const shipment = await prisma.shipment.findUnique({ where: { id } });
  if (!shipment) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const podImage = formData.get("podImage") as File;

  if (!podImage) {
    return NextResponse.json({ error: "podImage is required" }, { status: 400 });
  }

  const bytes = await podImage.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `POD_${shipment.shipmentId}_${Date.now()}.jpeg`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), buffer);

  const podImagePath = `/uploads/${filename}`;

  await prisma.shipment.update({
    where: { id },
    data: { podImagePath, status: "DELIVERED" },
  });

  const analysis = await analyzeShipmentImages(shipment.qcImagePath, podImagePath);

  const updated = await prisma.shipment.update({
    where: { id },
    data: {
      aiRecommendation: analysis.recommendation,
      confidenceScore: analysis.confidenceScore,
      aiReasoning: JSON.stringify(analysis.reasoning),
    },
  });

  return NextResponse.json(updated);
}
