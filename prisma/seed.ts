import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const IMAGES_DIR = path.join(process.cwd(), "images");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

function copyImage(filename: string): string {
  const src = path.join(IMAGES_DIR, filename);
  const dest = path.join(UPLOADS_DIR, filename);
  fs.copyFileSync(src, dest);
  return `/uploads/${filename}`;
}

const prisma = new PrismaClient();

async function main() {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  await prisma.shipment.deleteMany();

  const shipments = [
    {
      shipmentId: "SHP-17784787",
      productName: "Pink Lily Bouquet",
      amount: 45.0,
      status: "DELIVERED",
      qcImagePath: copyImage("QC_17784787.jpeg"),
      podImagePath: copyImage("POD_17784787.jpeg"),
    },
    {
      shipmentId: "SHP-17906357",
      productName: "Mixed Rose Vase Arrangement",
      amount: 85.0,
      status: "DELIVERED",
      qcImagePath: copyImage("QC_17906357.jpeg"),
      podImagePath: copyImage("POD_17906357.jpeg"),
    },
    {
      shipmentId: "SHP-17909611",
      productName: "Pink Spray Rose Bouquet",
      amount: 65.0,
      status: "YET_TO_BE_DELIVERED",
      qcImagePath: copyImage("qc_17909611.jpeg"),
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
