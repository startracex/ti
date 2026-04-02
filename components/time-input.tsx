"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  type TimeToken,
  parseTimeToken,
  parseTimeRange,
  extractTimeTokens,
  formatTimeToken,
} from "@/lib/time-parser";
import { AlertCircle } from "lucide-react";

interface TimeInputProps {
  pendingToken: TimeToken | null;
  onSubmit: (tokens: TimeToken[], rawInput: string) => void;
  onError: (error: string) => void;
  onClearError: () => void;
  error: string | null;
}

export function TimeInput({
  pendingToken,
  onSubmit,
  onError,
  onClearError,
  error,
}: TimeInputProps) {
  const [input, setInput] = useState("");

  const [, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const now = new Date();
  const currentTimeDisplay = formatTimeToken({
    hours: now.getHours(),
    minutes: now.getMinutes(),
    original: "",
  });

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    onClearError();

    let inputToProcess = input.trim();

    // If input is empty, use current time
    if (!inputToProcess) {
      const now = new Date();
      inputToProcess = `${now.getHours().toString().padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}`;
    }

    const parsedTokens: TimeToken[] = [];

    const rangeResult = parseTimeRange(inputToProcess);
    if (rangeResult !== null) {
      parsedTokens.push(rangeResult[0], rangeResult[1]);
    } else {
      const tokens = extractTimeTokens(inputToProcess);
      for (const tokenStr of tokens) {
        const token = parseTimeToken(tokenStr);
        if (!token) {
          onError("Invalid time format");
          return;
        }
        parsedTokens.push(token);
      }
    }

    if (parsedTokens.length === 0) {
      onError("Invalid time format");
      return;
    }

    onSubmit(parsedTokens, inputToProcess);
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            id="time-input"
            type="text"
            autoFocus
            placeholder={currentTimeDisplay}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              onClearError();
            }}
          />
          <Button type="submit" className="cursor-pointer px-6">
            Submit
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {pendingToken && (
        <div className="p-3 bg-primary/10 text-primary rounded-md text-sm">
          Pending start time: {pendingToken.hours.toString().padStart(2, "0")}:
          {pendingToken.minutes.toString().padStart(2, "0")}
        </div>
      )}
    </form>
  );
}
