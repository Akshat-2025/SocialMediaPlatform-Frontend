import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin text-muted-foreground", className)} />;
}

export function PageSpinner() {
  return (
    <div className="flex w-full items-center justify-center py-16">
      <Spinner className="h-6 w-6" />
    </div>
  );
}
