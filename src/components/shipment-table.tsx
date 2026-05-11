"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Upload,
  Sparkles,
  AlertTriangle,
  ImageIcon,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import type { Shipment } from "@/types/shipment";
import { ExpandedRow } from "./expanded-row";
import { ImagePreview } from "./image-preview";

interface Props {
  shipments: Shipment[];
  activeTab: string;
  onAction: () => void;
  onUploadPod: (shipment: Shipment) => void;
}

export function ShipmentTable({
  shipments,
  activeTab,
  onAction,
  onUploadPod,
}: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleStatusChange(id: string, status: "APPROVED" | "REJECTED") {
    setActionLoading(id);
    const res = await fetch(`/api/shipments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success(`Shipment ${status.toLowerCase()}`);
      onAction();
    } else {
      toast.error("Action failed");
    }
    setActionLoading(null);
  }

  async function handleReanalyze(id: string) {
    setActionLoading(id);
    const res = await fetch(`/api/shipments/${id}/analyze`, { method: "POST" });
    if (res.ok) {
      toast.success("Re-analysis complete");
      onAction();
    } else {
      toast.error("Analysis failed");
    }
    setActionLoading(null);
  }

  if (shipments.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No shipments found</p>
      </div>
    );
  }

  const isDeliveredTab = activeTab === "DELIVERED";

  if (isDeliveredTab) {
    const approveGroup = shipments.filter((s) => s.aiRecommendation === "Approve");
    const reviewGroup = shipments.filter((s) => s.aiRecommendation === "Review");
    const pendingGroup = shipments.filter((s) => !s.aiRecommendation);

    return (
      <div className="space-y-3">
        {approveGroup.length > 0 && (
          <GroupSection label="AI Suggest: Approve" variant="approve" count={approveGroup.length}>
            <CardList
              shipments={approveGroup}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              actionLoading={actionLoading}
              activeTab={activeTab}
              onStatusChange={handleStatusChange}
              onReanalyze={handleReanalyze}
              onUploadPod={onUploadPod}
            />
          </GroupSection>
        )}
        {reviewGroup.length > 0 && (
          <GroupSection label="AI Suggest: Review" variant="review" count={reviewGroup.length}>
            <CardList
              shipments={reviewGroup}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              actionLoading={actionLoading}
              activeTab={activeTab}
              onStatusChange={handleStatusChange}
              onReanalyze={handleReanalyze}
              onUploadPod={onUploadPod}
            />
          </GroupSection>
        )}
        {pendingGroup.length > 0 && (
          <GroupSection label="AI Analysis Pending" variant="pending" count={pendingGroup.length}>
            <CardList
              shipments={pendingGroup}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              actionLoading={actionLoading}
              activeTab={activeTab}
              onStatusChange={handleStatusChange}
              onReanalyze={handleReanalyze}
              onUploadPod={onUploadPod}
            />
          </GroupSection>
        )}
      </div>
    );
  }

  return (
    <div>
      <HeaderRow activeTab={activeTab} />
      <CardList
        shipments={shipments}
        expandedIds={expandedIds}
        toggleExpand={toggleExpand}
        actionLoading={actionLoading}
        activeTab={activeTab}
        onStatusChange={handleStatusChange}
        onReanalyze={handleReanalyze}
        onUploadPod={onUploadPod}
      />
    </div>
  );
}

function HeaderRow({ activeTab }: { activeTab: string }) {
  return (
    <div className="grid grid-cols-12 gap-3 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky top-[52px] bg-gray-50 z-10 border-b mb-2">
      <div className="col-span-1"></div>
      <div className="col-span-2">Shipment ID</div>
      <div className="col-span-2">Product</div>
      <div className="col-span-1 text-right">Amount</div>
      <div className="col-span-1">QC</div>
      <div className="col-span-1">POD</div>
      <div className="col-span-2">AI Suggestion</div>
      <div className="col-span-2 text-right">
        {activeTab === "YET_TO_BE_DELIVERED" ? "Upload" : "Actions"}
      </div>
    </div>
  );
}

function GroupSection({
  label,
  variant,
  count,
  children,
}: {
  label: string;
  variant: "approve" | "review" | "pending";
  count: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const colors = {
    approve: "bg-emerald-50 text-emerald-700 border-emerald-200",
    review: "bg-amber-50 text-amber-700 border-amber-200",
    pending: "bg-gray-50 text-gray-600 border-gray-200",
  };
  const icons = {
    approve: <Sparkles className="h-4 w-4" />,
    review: <AlertTriangle className="h-4 w-4" />,
    pending: <ImageIcon className="h-4 w-4" />,
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium w-full ${colors[variant]}`}
        >
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          {icons[variant]}
          {label}
          <Badge variant="secondary" className="ml-auto text-xs">
            {count}
          </Badge>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">{children}</CollapsibleContent>
    </Collapsible>
  );
}

function CardList({
  shipments,
  expandedIds,
  toggleExpand,
  actionLoading,
  activeTab,
  onStatusChange,
  onReanalyze,
  onUploadPod,
}: {
  shipments: Shipment[];
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  actionLoading: string | null;
  activeTab: string;
  onStatusChange: (id: string, status: "APPROVED" | "REJECTED") => void;
  onReanalyze: (id: string) => void;
  onUploadPod: (shipment: Shipment) => void;
}) {
  return (
    <div className="space-y-2">
      {shipments.map((s) => (
        <ShipmentCard
          key={s.id}
          shipment={s}
          isExpanded={expandedIds.has(s.id)}
          isLoading={actionLoading === s.id}
          activeTab={activeTab}
          onToggle={() => toggleExpand(s.id)}
          onStatusChange={onStatusChange}
          onReanalyze={onReanalyze}
          onUploadPod={onUploadPod}
        />
      ))}
    </div>
  );
}

function ShipmentCard({
  shipment,
  isExpanded,
  isLoading,
  activeTab,
  onToggle,
  onStatusChange,
  onReanalyze,
  onUploadPod,
}: {
  shipment: Shipment;
  isExpanded: boolean;
  isLoading: boolean;
  activeTab: string;
  onToggle: () => void;
  onStatusChange: (id: string, status: "APPROVED" | "REJECTED") => void;
  onReanalyze: (id: string) => void;
  onUploadPod: (shipment: Shipment) => void;
}) {
  const reasoning: string[] = shipment.aiReasoning
    ? JSON.parse(shipment.aiReasoning)
    : [];

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Card row */}
      <div
        className="grid grid-cols-12 gap-3 items-center px-4 py-3 cursor-pointer"
        onClick={onToggle}
      >
        {/* Expand chevron */}
        <div className="col-span-1 flex items-center">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        {/* Shipment ID */}
        <div className="col-span-2">
          <span className="font-mono text-sm font-medium text-blue-600">
            {shipment.shipmentId}
          </span>
        </div>

        {/* Product */}
        <div className="col-span-2">
          <span className="text-sm text-gray-900 truncate block">
            {shipment.productName}
          </span>
        </div>

        {/* Amount */}
        <div className="col-span-1 text-right">
          <span className="text-sm font-medium">
            AED {shipment.amount.toFixed(2)}
          </span>
        </div>

        {/* QC Image */}
        <div className="col-span-1">
          <ImagePreview
            src={shipment.qcImagePath}
            alt="QC"
            thumbnailClassName="w-11 h-11 rounded-md object-cover border"
          />
        </div>

        {/* POD Image */}
        <div className="col-span-1">
          <ImagePreview
            src={shipment.podImagePath}
            alt="POD"
            thumbnailClassName="w-11 h-11 rounded-md object-cover border"
          />
        </div>

        {/* AI Suggestion */}
        <div className="col-span-2">
          <AiSuggestionBadge shipment={shipment} />
        </div>

        {/* Actions */}
        <div className="col-span-2 flex justify-end" onClick={(e) => e.stopPropagation()}>
          {activeTab === "YET_TO_BE_DELIVERED" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => onUploadPod(shipment)}
              disabled={isLoading}
            >
              <Upload className="h-4 w-4 mr-1" />
              Upload POD
            </Button>
          )}
          {activeTab === "DELIVERED" && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                onClick={() => onStatusChange(shipment.id, "APPROVED")}
                disabled={isLoading}
                title="Approve"
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onStatusChange(shipment.id, "REJECTED")}
                disabled={isLoading}
                title="Reject"
              >
                <XCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                onClick={() => onReanalyze(shipment.id)}
                disabled={isLoading}
                title="Re-analyze"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {isExpanded && <ExpandedRow shipment={shipment} reasoning={reasoning} />}
    </div>
  );
}

function AiSuggestionBadge({ shipment }: { shipment: Shipment }) {
  if (!shipment.aiRecommendation) {
    if (shipment.status === "YET_TO_BE_DELIVERED") {
      return <span className="text-xs text-muted-foreground">Awaiting POD</span>;
    }
    return <span className="text-xs text-muted-foreground">Pending</span>;
  }

  if (shipment.aiRecommendation === "Approve") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Approve
      </Badge>
    );
  }

  return (
    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
      <AlertTriangle className="h-3 w-3 mr-1" />
      Review
    </Badge>
  );
}
