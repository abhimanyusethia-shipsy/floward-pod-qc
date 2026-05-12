import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeShipmentImages } from "@/lib/gemini";
import { put } from "@vercel/blob";

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

  const filename = `POD_${shipment.shipmentId}_${Date.now()}.jpeg`;
  const blob = await put(filename, podImage, { access: "public" });

  const podImagePath = blob.url;

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
