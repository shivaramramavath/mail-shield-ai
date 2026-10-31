
"use client";

import { Loader2, Sparkles } from "lucide-react";

interface AILoadingProps {
  message?: string;
}

export function AILoading({
  message = "AI is processing your request...",
}: AILoadingProps) {
  return (
    <div
      className="flex items-center gap-3 rounded-lg border p-5"
      role="status"
      aria-live="polite"
    >
      <div className="relative flex size-10 items-center justify-center rounded-full border">
        <Sparkles className="size-4" />
        <Loader2 className="absolute -right-1 -top-1 size-4 animate-spin" />
      </div>

      <div>
        <p className="text-sm font-medium">{message}</p>
        <p className="text-xs text-muted-foreground">
          Please wait while the request is processed.
        </p>
      </div>
    </div>
  );
}
