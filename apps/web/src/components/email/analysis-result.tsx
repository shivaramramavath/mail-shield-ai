
import {
  Activity,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Cpu,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassificationBadge } from "./classification-badge";
import { SpamScore } from "./spam-score";

export interface AnalysisResultData {
  label: string;
  spamProbability: number;
  hamProbability: number;
  durationMs: number;
  modelVersion?: string;
  suspiciousPhrases?: string[];
}

interface AnalysisResultProps {
  result: AnalysisResultData;
}

export function AnalysisResult({ result }: AnalysisResultProps) {
  const isSpam = result.label.toLowerCase() === "spam";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isSpam ? (
              <ShieldAlert className="size-5" />
            ) : (
              <ShieldCheck className="size-5" />
            )}
            Classification Result
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <ClassificationBadge label={result.label} />

          <p className="text-sm text-muted-foreground">
            {isSpam
              ? "The model identified patterns associated with spam."
              : "The model classified this email as legitimate (ham)."}
          </p>
        </CardContent>
      </Card>

      <SpamScore probability={result.spamProbability} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <Activity className="mb-3 size-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Ham probability</p>
            <p className="mt-1 text-xl font-bold">
              {(result.hamProbability * 100).toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <Clock className="mb-3 size-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Inference time</p>
            <p className="mt-1 text-xl font-bold">
              {result.durationMs} ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <Cpu className="mb-3 size-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Model version</p>
            <p className="mt-1 truncate text-xl font-bold">
              {result.modelVersion || "Unknown"}
            </p>
          </CardContent>
        </Card>
      </div>

      {result.suspiciousPhrases?.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Suspicious phrases
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-wrap gap-2">
            {result.suspiciousPhrases.map((phrase, index) => (
              <span
                key={`${phrase}-${index}`}
                className="rounded-md border px-3 py-2 text-sm"
              >
                {phrase}
              </span>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
