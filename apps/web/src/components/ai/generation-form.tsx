
"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface GenerationFormProps {
  onGenerate: (data: {
    prompt: string;
    tone: string;
    length: string;
  }) => Promise<void>;
  loading?: boolean;
}

export function GenerationForm({
  onGenerate,
  loading = false,
}: GenerationFormProps) {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!prompt.trim()) {
      toast.error("Describe the email you want to generate.");
      return;
    }

    await onGenerate({ prompt, tone, length });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email-prompt">Email requirements</Label>

        <Textarea
          id="email-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Example: Write an email requesting a meeting with my manager..."
          className="min-h-40"
          maxLength={2000}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email-tone">Tone</Label>

          <select
            id="email-tone"
            value={tone}
            onChange={(event) => setTone(event.target.value)}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="professional">Professional</option>
            <option value="formal">Formal</option>
            <option value="casual">Casual</option>
            <option value="friendly">Friendly</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email-length">Length</Label>

          <select
            id="email-length"
            value={length}
            onChange={(event) => setLength(event.target.value)}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading || !prompt.trim()}
        className="w-full sm:w-auto"
      >
        {loading ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 size-4" />
        )}

        {loading ? "Generating..." : "Generate Email"}
      </Button>
    </form>
  );
}
