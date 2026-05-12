import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";

const IMAGES_DIR = path.join(process.cwd(), "images");

async function uploadImage(filename: string): Promise<string> {
  const filePath = path.join(IMAGES_DIR, filename);
  const buffer = fs.readFileSync(filePath);
  const blob = await put(filename, buffer, { access: "public" });
  console.log(`  Uploaded ${filename} → ${blob.url}`);
  return blob.url;
}

const prisma = new PrismaClient();

async function main() {
  await prisma.shipment.deleteMany();

  const shipments = [
    {
      shipmentId: "SHP-17784787",
      productName: "Pink Lily Bouquet",
      amount: 45.0,
      status: "DELIVERED",
      qcImagePath: await uploadImage("QC_17784787.jpeg"),
      podImagePath: await uploadImage("POD_17784787.jpeg"),
    },
    {
      shipmentId: "SHP-17906357",
      productName: "Mixed Rose Vase Arrangement",
      amount: 85.0,
      status: "DELIVERED",
      qcImagePath: await uploadImage("QC_17906357.jpeg"),
      podImagePath: await uploadImage("POD_17906357.jpeg"),
    },
    {
      shipmentId: "SHP-17909611",
      productName: "Pink Spray Rose Bouquet",
      amount: 65.0,
      status: "YET_TO_BE_DELIVERED",
      qcImagePath: await uploadImage("qc_17909611.jpeg"),
      podImagePath: null,
    },
  ];

  for (const s of shipments) {
    await prisma.shipment.create({ data: s });
    console.log(`Created shipment: ${s.shipmentId} (${s.status})`);
  }

  console.log("Seed completed.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
