import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeShipmentImages } from "@/lib/gemini";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const shipment = await prisma.shipment.findUnique({ where: { id } });
  if (!shipment) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }

  if (!shipment.podImagePath) {
    return NextResponse.json(
      { error: "No POD image uploaded yet" },
      { status: 400 }
    );
  }

  const analysis = await analyzeShipmentImages(
    shipment.qcImagePath,
    shipment.podImagePath
  );

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
