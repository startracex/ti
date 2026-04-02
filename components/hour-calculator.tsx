"use client";

import { useEffect, useState, useRef } from "react";
import { type TimeToken } from "@/lib/time-parser";
import {
  type CalculatorState,
  initialState,
  processToken,
  removeTimeRange,
  editTimeRange,
  clearAll,
} from "@/lib/state-manager";
import { decodeStateFromUrl, encodeStateToUrl } from "@/lib/url-encoder";
import { TimeInput } from "./time-input";
import { TimeRangesList } from "./time-ranges-list";
import { TotalHoursDisplay } from "./total-hours-display";
import { Button } from "@/components/ui/button";

export function HourCalculator() {
  const [state, setState] = useState<CalculatorState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const mountedRef = useRef(false);

  // Load state from localStorage and URL on mount
  useEffect(() => {
    mountedRef.current = true;

    // Try to load from URL first
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has("r") || searchParams.has("p")) {
      const urlState = decodeStateFromUrl(searchParams);
      if (urlState.ranges || urlState.pendingToken) {
        setState({
          ranges: urlState.ranges || [],
          pendingToken: urlState.pendingToken || null,
          totalMinutes: urlState.totalMinutes || 0,
        });
        setIsLoaded(true);
        return;
      }
    }

    setIsLoaded(true);
  }, []);

  // Update URL separately to avoid router initialization issues
  useEffect(() => {
    if (!isLoaded || !mountedRef.current) return;

    // Use setTimeout to defer URL update to next event loop, after router is ready
    const timeoutId = setTimeout(() => {
      try {
        const newUrl = encodeStateToUrl(state);
        if (typeof window !== "undefined" && window.history) {
          window.history.replaceState(null, "", newUrl || "/");
        }
      } catch (err) {
        console.error("Failed to update URL:", err);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [state, isLoaded]);

  const handleSubmit = (tokens: TimeToken[], rawInput: string) => {
    let newState = { ...state };

    // Process tokens in pairs
    let i = 0;

    // If there's a pending token, pair it with the first new token
    if (newState.pendingToken && tokens.length > 0) {
      newState = processToken(newState, tokens[0]);
      i = 1;
    }

    // Process remaining tokens in pairs
    while (i < tokens.length) {
      if (i + 1 < tokens.length) {
        // We have a pair
        newState = processToken(newState, tokens[i]);
        newState = processToken(newState, tokens[i + 1]);
        i += 2;
      } else {
        // Single token at the end - make it pending
        newState = processToken(newState, tokens[i]);
        i += 1;
      }
    }

    setState(newState);
    setError(null);
  };

  const handleRemoveRange = (index: number) => {
    setState(removeTimeRange(state, index));
  };

  const handleEditRange = (index: number, start: TimeToken, end: TimeToken) => {
    setState(editTimeRange(state, index, start, end));
  };

  const handleClearAll = () => {
    setState(clearAll(state));
    setError(null);
  };

  if (!isLoaded) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-center mb-8">Shiro Wang's Time Inspector</h1>

      <TimeInput
        pendingToken={state.pendingToken}
        onSubmit={handleSubmit}
        onError={setError}
        onClearError={() => setError(null)}
        error={error}
      />

      <TotalHoursDisplay totalMinutes={state.totalMinutes} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Time range records</h2>
          {state.ranges.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              Clear
            </Button>
          )}
        </div>
        <TimeRangesList
          ranges={state.ranges}
          onRemove={handleRemoveRange}
          onEdit={handleEditRange}
        />
      </div>
    </div>
  );
}
