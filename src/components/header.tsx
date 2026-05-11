"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Flower2, LogOut } from "lucide-react";

export function Header() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <Flower2 className="h-6 w-6 text-emerald-600" />
          <span className="text-lg font-bold text-gray-900">Floward</span>
          <span className="text-sm text-muted-foreground ml-1">
            POD Quality Control
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-muted-foreground"
        >
          <LogOut className="h-4 w-4 mr-1" />
          Logout
        </Button>
      </div>
    </header>
  );
}
