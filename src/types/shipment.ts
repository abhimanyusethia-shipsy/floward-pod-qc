export interface Shipment {
  id: string;
  shipmentId: string;
  productName: string;
  amount: number;
  status: string;
  qcImagePath: string;
  podImagePath: string | null;
  aiRecommendation: string | null;
  confidenceScore: number | null;
  aiReasoning: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentCounts {
  YET_TO_BE_DELIVERED: number;
  DELIVERED: number;
  APPROVED: number;
  REJECTED: number;
}

export interface AnalysisResult {
  recommendation: "Approve" | "Review";
  confidenceScore: number;
  reasoning: string[];
}

export interface ShipmentsResponse {
  shipments: Shipment[];
  counts: ShipmentCounts;
}
