
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SuspiciousPhrasesProps {
  phrases: string[];
}

export function SuspiciousPhrases({
  phrases,
}: SuspiciousPhrasesProps) {
  if (!phrases.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="size-4" />
          Suspicious phrases
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {phrases.map((phrase, index) => (
          <div
            key={`${phrase}-${index}`}
            className="rounded-md border px-3 py-2 text-sm"
          >
            {phrase}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
