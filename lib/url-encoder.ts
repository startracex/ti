/**
 * URL Encoder for sharing state
 * Encodes/decodes calculator state as URL parameters
 */

import type { CalculatorState } from "./state-manager";

/**
 * Encode state to URL search parameters
 * Uses a compact format to minimize URL length
 */
export function encodeStateToUrl(state: CalculatorState): string {
  const data = {
    r: state.ranges
      .map(
        (r) =>
          `${r.start.hours.toString().padStart(2, "0")}${r.start.minutes.toString().padStart(2, "0")}-${r.end.hours.toString().padStart(2, "0")}${r.end.minutes.toString().padStart(2, "0")}`,
      )
      .join(","),
    p: state.pendingToken
      ? `${state.pendingToken.hours.toString().padStart(2, "0")}${state.pendingToken.minutes.toString().padStart(2, "0")}`
      : "",
  };

  const params = new URLSearchParams();
  if (data.r) {
    params.set("r", data.r);
  }
  if (data.p) {
    params.set("p", data.p);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * Decode URL search parameters to state
 */
export function decodeStateFromUrl(searchParams: URLSearchParams): Partial<CalculatorState> {
  const result: Partial<CalculatorState> = {
    ranges: [],
    pendingToken: null,
  };

  // Decode ranges
  const rangesStr = searchParams.get("r");
  if (rangesStr) {
    const ranges = rangesStr.split(",");
    for (const range of ranges) {
      const [startStr, endStr] = range.split("-");
      if (startStr && endStr) {
        const start = parseCompactTime(startStr);
        const end = parseCompactTime(endStr);
        if (start && end) {
          const durationMinutes = calculateDurationMinutes(start, end);
          result.ranges!.push({
            start,
            end,
            durationMinutes,
          });
        }
      }
    }
  }

  // Decode pending token
  const pendingStr = searchParams.get("p");
  if (pendingStr) {
    const pendingToken = parseCompactTime(pendingStr);
    if (pendingToken) {
      result.pendingToken = pendingToken;
    }
  }

  // Calculate total minutes
  const totalMinutes = (result.ranges || []).reduce((sum, range) => sum + range.durationMinutes, 0);
  result.totalMinutes = totalMinutes;

  return result;
}

/**
 * Parse compact time format: "0936" -> TimeToken
 */
function parseCompactTime(str: string): any | null {
  if (!str) return null;

  const normalized = str.replace(/[:\s]/g, "");
  if (!/^\d+$/.test(normalized)) {
    return null;
  }

  let hours = 0;
  let minutes = 0;

  if (normalized.length === 1) {
    hours = parseInt(normalized, 10);
  } else if (normalized.length === 2) {
    minutes = parseInt(normalized, 10);
  } else if (normalized.length === 3) {
    hours = parseInt(normalized[0], 10);
    minutes = parseInt(normalized.slice(1), 10);
  } else if (normalized.length >= 4) {
    const lastFour = normalized.slice(-4);
    hours = parseInt(lastFour.slice(0, 2), 10);
    minutes = parseInt(lastFour.slice(2), 10);
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return { hours, minutes, original: str };
}

/**
 * Calculate duration in minutes between two times
 */
function calculateDurationMinutes(
  start: { hours: number; minutes: number },
  end: { hours: number; minutes: number },
): number {
  const startMinutes = start.hours * 60 + start.minutes;
  const endMinutes = end.hours * 60 + end.minutes;

  if (endMinutes < startMinutes) {
    return 24 * 60 - startMinutes + endMinutes;
  }

  return endMinutes - startMinutes;
}

/**
 * Generate shareable URL
 */
export function generateShareUrl(state: CalculatorState): string {
  const params = encodeStateToUrl(state);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";

  return params ? `${baseUrl}${pathname}?${params}` : `${baseUrl}${pathname}`;
}
