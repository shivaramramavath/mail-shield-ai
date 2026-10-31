
import { Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmailPreviewProps {
  subject?: string;
  content: string;
  sender?: string;
}

export function EmailPreview({
  subject,
  content,
  sender = "Preview",
}: EmailPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="size-4" />
          Email Preview
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="border-b pb-3">
          <p className="text-xs text-muted-foreground">From</p>
          <p className="text-sm font-medium">{sender}</p>
        </div>

        <div className="border-b pb-3">
          <p className="text-xs text-muted-foreground">Subject</p>
          <p className="text-sm font-semibold">
            {subject || "No subject"}
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs text-muted-foreground">Message</p>
          <p className="whitespace-pre-wrap break-words text-sm leading-7">
            {content || "No email content"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
