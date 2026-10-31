
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SpamScoreProps {
  probability: number;
}

export function SpamScore({ probability }: SpamScoreProps) {
  const percentage = Math.max(
    0,
    Math.min(100, probability * 100)
  );

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Spam probability
          </p>

          <span className="text-2xl font-bold">
            {percentage.toFixed(2)}%
          </span>
        </div>

        <Progress value={percentage} />

        <p className="text-xs text-muted-foreground">
          Model-estimated probability, not a guarantee of maliciousness.
        </p>
      </CardContent>
    </Card>
  );
}
