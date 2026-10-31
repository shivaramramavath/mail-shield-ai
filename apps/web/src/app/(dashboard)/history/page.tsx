
import { History, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analysis History</h1>
        <p className="mt-2 text-muted-foreground">
          Review your previous email analysis activity.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center py-16 text-center">
          <History className="mb-4 size-10 text-muted-foreground" />
          <h2 className="text-lg font-semibold">No history available</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            This anonymous workspace does not retain email content or
            associate analysis records with individual visitors.
          </p>
          <ShieldCheck className="mt-5 size-5" />
          <p className="mt-2 text-xs text-muted-foreground">
            Privacy-first processing
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
