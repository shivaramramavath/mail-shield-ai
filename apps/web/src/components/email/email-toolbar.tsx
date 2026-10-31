
"use client";

import { Copy, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface EmailToolbarProps {
  content: string;
  onClear?: () => void;
  filename?: string;
}

export function EmailToolbar({
  content,
  onClear,
  filename = "mailshield-email.txt",
}: EmailToolbarProps) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard.");
    } catch {
      toast.error("Unable to copy content.");
    }
  }

  function download() {
    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={copy}>
        <Copy className="mr-2 size-4" />
        Copy
      </Button>

      <Button variant="outline" size="sm" onClick={download}>
        <Download className="mr-2 size-4" />
        Download
      </Button>

      {onClear && (
        <Button variant="outline" size="sm" onClick={onClear}>
          <Trash2 className="mr-2 size-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
