
"use client";

import { useState } from "react";
import { toast } from "sonner";

import { GenerationForm } from "@/components/ai/generation-form";
import { GeneratedEmail } from "@/components/ai/generated-email";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/axios";

export default function GeneratePage() {
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");

  async function handleGenerate(data: {
    prompt: string;
    tone: string;
    length: string;
  }) {
    try {
      setLoading(true);
      setGeneratedContent("");

      const response = await api.post("/api/v1/email/generate", {
        prompt: data.prompt,
        tone: data.tone,
        length: data.length,
      });

      const content = response.data?.content;

      if (typeof content !== "string" || !content.trim()) {
        throw new Error("The server returned an empty email.");
      }

      setGeneratedContent(content);
      toast.success("Email generated successfully.");
    } catch (error) {
      console.error("Email generation failed:", error);
      toast.error("Failed to generate email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          AI Email Generator
        </h1>

        <p className="text-sm text-muted-foreground">
          Generate professional emails with AI. Describe your requirements,
          choose a tone and length, and let MailShield AI write the email.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Requirements</CardTitle>
        </CardHeader>

        <CardContent>
          <GenerationForm
            onGenerate={handleGenerate}
            loading={loading}
          />
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Email</CardTitle>
          </CardHeader>

          <CardContent>
            <GeneratedEmail content={generatedContent} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
