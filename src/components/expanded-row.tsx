"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, ImageIcon } from "lucide-react";
import type { Shipment } from "@/types/shipment";
import { ImagePreview } from "./image-preview";

interface Props {
  shipment: Shipment;
  reasoning: string[];
}

export function ExpandedRow({ shipment, reasoning }: Props) {
  const isApprove = shipment.aiRecommendation === "Approve";

  return (
    <div className="bg-slate-50 border-t px-6 py-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            QC Image (Before Dispatch)
          </p>
          <ImagePreview
            src={shipment.qcImagePath}
            alt="QC"
            thumbnailClassName="rounded-lg border shadow-sm w-full h-64 object-contain bg-white"
          />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            POD Image (At Delivery)
          </p>
          {shipment.podImagePath ? (
            <ImagePreview
              src={shipment.podImagePath}
              alt="POD"
              thumbnailClassName="rounded-lg border shadow-sm w-full h-64 object-contain bg-white"
            />
          ) : (
            <div className="rounded-lg border bg-white h-64 flex flex-col items-center justify-center text-muted-foreground">
              <ImageIcon className="h-10 w-10 mb-2 opacity-30" />
              <span className="text-sm">No POD image yet</span>
            </div>
          )}
        </div>

        <div className="min-w-0 overflow-hidden">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            AI Analysis
          </p>
          <div className="bg-white rounded-lg border p-4 space-y-3 overflow-hidden">
            {shipment.aiRecommendation ? (
              <>
                <div className="flex items-center gap-2">
                  {isApprove ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 text-sm px-3 py-1">
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      Approve
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-sm px-3 py-1">
                      <AlertTriangle className="h-4 w-4 mr-1.5" />
                      Needs Review
                    </Badge>
                  )}
                </div>

                {shipment.confidenceScore != null && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">
                        {isApprove ? "Match Confidence" : "Mismatch Severity"}
                      </span>
                      <span className="font-medium">
                        {shipment.confidenceScore}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isApprove ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${shipment.confidenceScore}%` }}
                      />
                    </div>
                  </div>
                )}

                {reasoning.length > 0 && (
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">
                      Reasoning
                    </p>
                    <ul className="space-y-1.5">
                      {reasoning.map((r, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-700 flex items-start gap-2 min-w-0"
                        >
                          <span className="text-muted-foreground mt-0.5 shrink-0">
                            &bull;
                          </span>
                          <span className="break-words overflow-wrap-anywhere">
                            {r}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">No AI analysis yet</p>
                <p className="text-xs mt-1">
                  Upload a POD image to trigger analysis
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
