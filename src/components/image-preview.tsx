"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ImageIcon } from "lucide-react";

interface Props {
  src: string | null | undefined;
  alt: string;
  thumbnailClassName?: string;
}

export function ImagePreview({ src, alt, thumbnailClassName = "w-12 h-12 rounded-md object-cover border" }: Props) {
  const [open, setOpen] = useState(false);

  if (!src) {
    return (
      <div className={`${thumbnailClassName} bg-gray-100 flex items-center justify-center`}>
        <ImageIcon className="h-4 w-4 text-gray-400" />
      </div>
    );
  }

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`${thumbnailClassName} cursor-pointer hover:opacity-80 transition-opacity`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-2 bg-black/95 border-none">
          <img
            src={src}
            alt={alt}
            className="w-full h-auto max-h-[85vh] object-contain rounded"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
