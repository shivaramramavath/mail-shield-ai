
"use client";

import { useState } from "react";
import { Copy, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownRenderer } from "./markdown-renderer";

interface GeneratedEmailProps {
  content: string;
  onChange?: (value: string) => void;
}

export function GeneratedEmail({
  content,
  onChange,
}: GeneratedEmailProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);

  async function copy() {
    try {
      await navigator.clipboard.writeText(draft);
      toast.success("Email copied.");
    } catch {
      toast.error("Unable to copy email.");
    }
  }

  function save() {
    onChange?.(draft);
    setEditing(false);
    toast.success("Changes saved locally.");
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>Generated Email</CardTitle>

        <div className="flex gap-2">
          <Button size="icon" variant="outline" onClick={copy}>
            <Copy className="size-4" />
          </Button>

          {!editing ? (
            <Button
              size="icon"
              variant="outline"
              onClick={() => setEditing(true)}
            >
              <Pencil className="size-4" />
            </Button>
          ) : (
            <>
              <Button size="icon" variant="outline" onClick={save}>
                <Check className="size-4" />
              </Button>

              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  setDraft(content);
                  setEditing(false);
                }}
              >
                <X className="size-4" />
              </Button>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {editing ? (
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="min-h-64"
          />
        ) : (
          <MarkdownRenderer content={draft} />
        )}
      </CardContent>
    </Card>
  );
}
