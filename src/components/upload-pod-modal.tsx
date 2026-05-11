"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Shipment } from "@/types/shipment";

interface Props {
  shipment: Shipment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: () => void;
}

export function UploadPodModal({
  shipment,
  open,
  onOpenChange,
  onUploaded,
}: Props) {
  const [podFile, setPodFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!podFile || !shipment) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("podImage", podFile);

    const res = await fetch(`/api/shipments/${shipment.id}/upload-pod`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      toast.success(
        `POD uploaded — AI recommends: ${data.aiRecommendation || "Analyzing..."}`
      );
      setPodFile(null);
      if (fileRef.current) fileRef.current.value = "";
      onOpenChange(false);
      onUploaded();
    } else {
      const data = await res.json();
      toast.error(data.error || "Upload failed");
    }
    setLoading(false);
  }

  if (!shipment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Proof of Delivery</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium">{shipment.shipmentId}</p>
            <p className="text-sm text-muted-foreground">
              {shipment.productName}
            </p>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">
              QC Image (reference)
            </Label>
            <img
              src={shipment.qcImagePath}
              alt="QC"
              className="rounded-lg w-full max-h-48 object-cover border"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>POD Image</Label>
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-emerald-500 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {podFile ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-600">
                    <ImageIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">{podFile.name}</span>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    <Upload className="h-8 w-8 mx-auto mb-1" />
                    <p className="text-sm">Click to upload POD image</p>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setPodFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={loading || !podFile}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading & Analyzing...
                </>
              ) : (
                "Upload & Analyze"
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
