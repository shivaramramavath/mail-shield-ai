
"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import axios from "axios";
import { toast } from "sonner";
import {
  Loader2,
  Copy,
  ShieldCheck,
  AlertTriangle,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Mode = "analyze" | "generate" | "improve" | "security" | "batch";

type ApiResult = Record<string, unknown>;

type Prediction = {
  label: string;
  spamProbability: number;
  hamProbability: number;
  durationMs: number;
  modelVersion?: string;
  disclaimer?: string;
};

interface Props {
  mode: Mode;
}

function getString(
  value: unknown,
  fallback = ""
): string {
  return typeof value === "string" ? value : fallback;
}

function getNumber(
  value: unknown,
  fallback = 0
): number {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : fallback;
}

export default function EmailWorkspace({ mode }: Props) {
  const [text, setText] = useState("");
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);

  const config = {
    analyze: {
      title: "Email Spam Detection",
      description:
        "Identify spam and legitimate emails using machine learning.",
      placeholder: "Paste your complete email content here...",
      button: "Analyze Email",
    },
    generate: {
      title: "AI Email Generator",
      description: "Generate professional email content using AI.",
      placeholder: "Describe the email you want to generate...",
      button: "Generate Email",
    },
    improve: {
      title: "Email Improvement",
      description: "Improve your email's clarity and wording.",
      placeholder: "Paste the email you want to improve...",
      button: "Improve Email",
    },
    security: {
      title: "Email Security Scanner",
      description:
        "Analyze suspicious language and possible phishing attempts.",
      placeholder: "Paste a suspicious email here...",
      button: "Scan Email",
    },
    batch: {
      title: "Batch Email Analysis",
      description:
        "Enter one email per line to classify multiple emails.",
      placeholder: "Enter email 1...\nEnter email 2...",
      button: "Analyze Emails",
    },
  }[mode];

  async function submit() {
    if (!text.trim()) {
      toast.error("Please enter email content.");
      return;
    }

    if (mode === "batch") {
      const emails = text
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      if (emails.length > 20) {
        toast.error("You can analyze a maximum of 20 emails at once.");
        return;
      }
    }

    setLoading(true);
    setResult(null);

    const endpoints: Record<Mode, string> = {
      analyze: "/email/analyze",
      generate: "/email/generate",
      improve: "/email/improve",
      security: "/email/security-scan",
      batch: "/email/batch-analyze",
    };

    try {
      let body: Record<string, unknown>;

      if (mode === "generate") {
        body = {
          prompt: text,
          tone,
        };
      } else if (mode === "batch") {
        body = {
          emails: text
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
        };
      } else {
        body = { text };
      }

      const response = await axios.post(
        `${API}/api/v1${endpoints[mode]}`,
        body,
        {
          timeout: 60000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data: unknown = response.data;

      if (
        typeof data !== "object" ||
        data === null ||
        Array.isArray(data)
      ) {
        throw new Error("Invalid response received from the server.");
      }

      setResult(data as ApiResult);
      toast.success("Processing completed.");
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? getString(
            error.response?.data?.message,
            error.message || "Request failed."
          )
        : error instanceof Error
          ? error.message
          : "Something went wrong.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(result, null, 2)
      );

      toast.success("Result copied.");
    } catch {
      toast.error("Unable to copy result.");
    }
  }

  const prediction: Prediction | null =
    mode === "analyze" && result
      ? {
          label: getString(result.label, "unknown"),
          spamProbability: getNumber(
            result.spamProbability ?? result.spam_probability
          ),
          hamProbability: getNumber(
            result.hamProbability ?? result.ham_probability
          ),
          durationMs: getNumber(
            result.durationMs ?? result.duration_ms
          ),
          modelVersion: getString(
            result.modelVersion ?? result.model_version,
            "Unknown"
          ),
          disclaimer: getString(result.disclaimer),
        }
      : null;

  const markdownContent = result
    ? getString(result.content, JSON.stringify(result, null, 2))
    : "";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck className="size-5" />
          <Badge variant="outline">MailShield Intelligence</Badge>
        </div>

        <h1 className="text-3xl font-bold tracking-tight">
          {config.title}
        </h1>

        <p className="mt-2 text-muted-foreground">
          {config.description}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Content</CardTitle>
          <CardDescription>
            Your content is processed by the MailShield backend.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={config.placeholder}
            className="min-h-64 resize-y font-mono text-sm"
            maxLength={mode === "generate" ? 2000 : 20000}
          />

          {mode === "generate" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Email tone
              </label>

              <select
                value={tone}
                onChange={(event) => setTone(event.target.value)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="professional">Professional</option>
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {text.length} / {mode === "generate" ? 2000 : 20000}
            </span>

            <Button
              onClick={submit}
              disabled={loading || !text.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="mr-2 size-4" />
                  {config.button}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {prediction && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                Classification
              </p>

              <div className="mt-3 flex items-center gap-2">
                {prediction.label.toLowerCase() === "spam" ? (
                  <AlertTriangle className="size-5" />
                ) : (
                  <ShieldCheck className="size-5" />
                )}

                <span className="text-2xl font-bold uppercase">
                  {prediction.label}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                Spam probability
              </p>

              <p className="mt-2 text-2xl font-bold">
                {(prediction.spamProbability * 100).toFixed(2)}%
              </p>

              <Progress
                value={Math.min(
                  100,
                  Math.max(0, prediction.spamProbability * 100)
                )}
                className="mt-3"
              />
            </CardContent>
          </Card>

          <Card className="sm:col-span-2">
            <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  Ham probability
                </p>

                <p className="text-xl font-semibold">
                  {(prediction.hamProbability * 100).toFixed(2)}%
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Processing time
                </p>

                <p className="text-xl font-semibold">
                  {prediction.durationMs} ms
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Model version
                </p>

                <p className="text-xl font-semibold">
                  {prediction.modelVersion || "Unknown"}
                </p>
              </div>
            </CardContent>
          </Card>

          {prediction.disclaimer && (
            <p className="text-xs text-muted-foreground sm:col-span-2">
              {prediction.disclaimer}
            </p>
          )}
        </div>
      )}

      {result !== null && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Analysis Result</CardTitle>
              <CardDescription>
                Output returned by MailShield AI.
              </CardDescription>
            </div>

            <Button
              size="icon"
              variant="outline"
              onClick={copyResult}
              aria-label="Copy result"
            >
              <Copy className="size-4" />
            </Button>
          </CardHeader>

          <CardContent>
            {mode === "analyze" ? (
              <pre className="overflow-x-auto whitespace-pre-wrap break-words text-sm text-muted-foreground">
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : (
              <article className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-semibold">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {markdownContent}
                </ReactMarkdown>
              </article>
            )}
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        ML predictions are estimates, not security guarantees. Never rely
        exclusively on automated classification to determine whether an
        email or link is safe.
      </p>
    </div>
  );
}
