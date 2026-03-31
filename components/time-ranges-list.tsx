"use client";

import { useState } from "react";
import type { TimeRange } from "@/lib/state-manager";
import { type TimeToken, formatDurationWithDecimal, parseTimeToken } from "@/lib/time-parser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, Edit2, Check, X } from "lucide-react";

interface TimeRangesListProps {
  ranges: TimeRange[];
  onRemove: (index: number) => void;
  onEdit: (index: number, start: TimeToken, end: TimeToken) => void;
}

function formatTime(hours: number, minutes: number): string {
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

export function TimeRangesList({ ranges, onRemove, onEdit }: TimeRangesListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editError, setEditError] = useState("");

  const handleEditStart = (index: number) => {
    setEditingIndex(index);
    setEditStart(
      `${ranges[index].start.hours.toString().padStart(2, "0")}:${ranges[index].start.minutes.toString().padStart(2, "0")}`,
    );
    setEditEnd(
      `${ranges[index].end.hours.toString().padStart(2, "0")}:${ranges[index].end.minutes.toString().padStart(2, "0")}`,
    );
    setEditError("");
  };

  const handleEditSave = (index: number) => {
    const startToken = parseTimeToken(editStart);
    const endToken = parseTimeToken(editEnd);

    if (!startToken || !endToken) {
      setEditError("Invalid time format");
      return;
    }

    // Sort times - no need to check if different, editTimeRange handles it
    let start = startToken;
    let end = endToken;
    const startMin = start.hours * 60 + start.minutes;
    const endMin = end.hours * 60 + end.minutes;

    if (startMin > endMin) {
      [start, end] = [end, start];
    }

    onEdit(index, start, end);
    setEditingIndex(null);
  };

  if (ranges.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No time range was recorded</div>;
  }

  return (
    <div className="space-y-2">
      {ranges.map((range, index) => (
        <Card key={index} className="h-18 p-4 flex justify-center">
          {editingIndex === index ? (
            <div className="flex gap-2">
              <Input
                type="text"
                value={editStart}
                onChange={(e) => {
                  setEditStart(e.target.value);
                  setEditError("");
                }}
                className="font-mono"
              />
              <Input
                type="text"
                value={editEnd}
                onChange={(e) => {
                  setEditEnd(e.target.value);
                  setEditError("");
                }}
                className="font-mono"
              />
              {editError && <div className="text-xs text-destructive">{editError}</div>}
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingIndex(null)}
                  className="text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleEditSave(index)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <div className="font-mono text-lg font-semibold">
                    {formatTime(range.start.hours, range.start.minutes)}
                    <span className="text-muted-foreground mx-2">→</span>
                    {formatTime(range.end.hours, range.end.minutes)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDurationWithDecimal(range.durationMinutes)}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditStart(index)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(index)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
