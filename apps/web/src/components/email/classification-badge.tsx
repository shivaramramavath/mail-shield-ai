
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ClassificationBadgeProps {
  label: string;
  className?: string;
}

export function ClassificationBadge({
  label,
  className,
}: ClassificationBadgeProps) {
  const isSpam = label.toLowerCase() === "spam";

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        isSpam
          ? "border-foreground bg-foreground text-background"
          : "border-foreground bg-background text-foreground",
        className
      )}
    >
      {isSpam ? "Spam" : "Ham"}
    </Badge>
  );
}
