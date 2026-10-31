
"use client";

import { useState } from "react";
import { Trash2, ClipboardPaste } from "lucide-react";
import { toast } from "sonner";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface EmailEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  minHeight?: string;
}

export function EmailEditor({
  value,
  onChange,
  placeholder = "Paste your email content here...",
  maxLength = 20000,
  minHeight = "min-h-64",
}: EmailEditorProps) {
  const [pasting, setPasting] = useState(false);

  async function pasteContent() {
    try {
      setPasting(true);
      const clipboard = await navigator.clipboard.readText();

      if (clipboard.length > maxLength) {
        toast.error("Email exceeds the maximum character limit.");
        return;
      }

      onChange(clipboard);
      toast.success("Content pasted.");
    } catch {
      toast.error("Unable to access clipboard.");
    } finally {
      setPasting(false);
    }
  }

  function clearContent() {
    onChange("");
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`resize-y border-0 ${minHeight} rounded-none shadow-none focus-visible:ring-0`}
      />

      <div className="flex items-center justify-between border-t bg-muted/30 px-3 py-2">
        <span className="text-xs text-muted-foreground">
          {value.length.toLocaleString()} / {maxLength.toLocaleString()}
        </span>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={pasteContent}
            disabled={pasting}
          >
            <ClipboardPaste className="mr-2 size-4" />
            Paste
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={clearContent}
            disabled={!value}
          >
            <Trash2 className="mr-2 size-4" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
