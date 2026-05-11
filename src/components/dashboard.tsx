"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw } from "lucide-react";
import type { Shipment, ShipmentCounts, ShipmentsResponse } from "@/types/shipment";
import { ShipmentTable } from "./shipment-table";
import { CreateShipmentModal } from "./create-shipment-modal";
import { UploadPodModal } from "./upload-pod-modal";

const TABS = [
  { value: "DELIVERED", label: "Delivered" },
  { value: "YET_TO_BE_DELIVERED", label: "Yet to Be Delivered" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
] as const;

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("DELIVERED");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [counts, setCounts] = useState<ShipmentCounts>({
    YET_TO_BE_DELIVERED: 0,
    DELIVERED: 0,
    APPROVED: 0,
    REJECTED: 0,
  });
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [uploadPodTarget, setUploadPodTarget] = useState<Shipment | null>(null);

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/shipments?status=${activeTab}`);
    if (res.ok) {
      const data: ShipmentsResponse = await res.json();
      setShipments(data.shipments);
      setCounts(data.counts);
    }
    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  return (
    <div className="flex-1">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b bg-white px-6">
          <div className="flex items-center justify-between py-3">
            <TabsList className="bg-transparent h-auto gap-0 p-0">
              {TABS.map((tab) => {
                const count = counts[tab.value as keyof ShipmentCounts];
                const isActive = activeTab === tab.value;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={`relative px-4 py-2.5 rounded-none border-b-2 data-[state=active]:shadow-none transition-all ${
                      isActive
                        ? "border-emerald-600 text-emerald-700 font-semibold"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                    <Badge
                      variant={isActive ? "default" : "secondary"}
                      className={`ml-2 text-xs ${
                        isActive
                          ? "bg-emerald-600 text-white"
                          : ""
                      }`}
                    >
                      {count}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchShipments}
                className="h-8 w-8"
                title="Refresh"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Shipment
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-0">
              {loading ? (
                <div className="text-center py-16 text-muted-foreground">
                  <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin" />
                  <p className="text-sm">Loading shipments...</p>
                </div>
              ) : (
                <ShipmentTable
                  shipments={shipments}
                  activeTab={activeTab}
                  onAction={fetchShipments}
                  onUploadPod={(s) => setUploadPodTarget(s)}
                />
              )}
            </TabsContent>
          ))}
        </div>
      </Tabs>

      <CreateShipmentModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={fetchShipments}
      />

      <UploadPodModal
        shipment={uploadPodTarget}
        open={!!uploadPodTarget}
        onOpenChange={(open) => {
          if (!open) setUploadPodTarget(null);
        }}
        onUploaded={fetchShipments}
      />
    </div>
  );
}
