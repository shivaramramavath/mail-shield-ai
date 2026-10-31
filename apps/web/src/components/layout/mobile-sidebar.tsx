
"use client";

import { Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/layout/app-sidebar";

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle>MailShield AI</SheetTitle>
        </SheetHeader>

        <AppSidebar />
      </SheetContent>
    </Sheet>
  );
}
