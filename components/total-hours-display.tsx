"use client";

import { Card } from "@/components/ui/card";
import { formatDurationWithDecimal } from "@/lib/time-parser";
import { Clock } from "lucide-react";

interface TotalHoursDisplayProps {
  totalMinutes: number;
}

export function TotalHoursDisplay({ totalMinutes }: TotalHoursDisplayProps) {
  return (
    <Card className="p-6 bg-linear-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Clock className="w-4 h-4" />
            <span>Total</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {formatDurationWithDecimal(totalMinutes)}
          </div>
        </div>
        <div className="text-6xl font-light text-primary/20 select-none grayscale-100">⏱</div>
      </div>
    </Card>
  );
}
