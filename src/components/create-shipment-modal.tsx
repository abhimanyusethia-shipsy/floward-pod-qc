"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateShipmentModal({ open, onOpenChange, onCreated }: Props) {
  const [shipmentId, setShipmentId] = useState("");
  const [productName, setProductName] = useState("");
  const [amount, setAmount] = useState("");
  const [qcFile, setQcFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setShipmentId("");
    setProductName("");
    setAmount("");
    setQcFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!qcFile) {
      toast.error("QC image is required");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("shipmentId", shipmentId);
    formData.append("productName", productName);
    formData.append("amount", amount);
    formData.append("qcImage", qcFile);

    const res = await fetch("/api/shipments", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      toast.success("Shipment created successfully");
      reset();
      onOpenChange(false);
      onCreated();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to create shipment");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Shipment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sid">Shipment ID</Label>
            <Input
              id="sid"
              value={shipmentId}
              onChange={(e) => setShipmentId(e.target.value)}
              placeholder="SHP-12345"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pname">Product Name</Label>
            <Input
              id="pname"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Red Rose Bouquet"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amt">Amount (AED)</Label>
            <Input
              id="amt"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="150.00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>QC Image (required)</Label>
            <div
              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-emerald-500 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {qcFile ? (
                <div className="flex items-center justify-center gap-2 text-emerald-600">
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">{qcFile.name}</span>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  <Upload className="h-8 w-8 mx-auto mb-1" />
                  <p className="text-sm">Click to upload QC image</p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setQcFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Shipment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
