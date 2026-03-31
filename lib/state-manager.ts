/**
 * State Manager for Work Hour Calculator
 * Manages time ranges, pending tokens, and calculations
 */

import { type TimeToken, timeTokenToMinutes } from "./time-parser";

export interface TimeRange {
  start: TimeToken;
  end: TimeToken;
  durationMinutes: number;
}

export interface CalculatorState {
  ranges: TimeRange[];
  pendingToken: TimeToken | null;
  totalMinutes: number;
}

export const initialState: CalculatorState = {
  ranges: [],
  pendingToken: null,
  totalMinutes: 0,
};

/**
 * Add a time range to the state
 */
export function addTimeRange(
  state: CalculatorState,
  start: TimeToken,
  end: TimeToken,
): CalculatorState {
  const durationMinutes = calculateDuration(start, end);

  return {
    ...state,
    ranges: [
      ...state.ranges,
      {
        start,
        end,
        durationMinutes,
      },
    ],
    pendingToken: null,
    totalMinutes: state.totalMinutes + durationMinutes,
  };
}

/**
 * Set a pending token (first part of a range)
 */
export function setPendingToken(state: CalculatorState, token: TimeToken): CalculatorState {
  return {
    ...state,
    pendingToken: token,
  };
}

/**
 * Complete a range with the pending token and a new token
 */
export function completePendingRange(state: CalculatorState, endToken: TimeToken): CalculatorState {
  if (!state.pendingToken) {
    return state;
  }

  // Check if start and end are the same time - if so, just clear pending and don't add
  const startMinutes = state.pendingToken.hours * 60 + state.pendingToken.minutes;
  const endMinutes = endToken.hours * 60 + endToken.minutes;

  if (startMinutes === endMinutes) {
    return {
      ...state,
      pendingToken: null,
    };
  }

  const durationMinutes = calculateDuration(state.pendingToken, endToken);

  return {
    ...state,
    ranges: [
      ...state.ranges,
      {
        start: state.pendingToken,
        end: endToken,
        durationMinutes,
      },
    ],
    pendingToken: null,
    totalMinutes: state.totalMinutes + durationMinutes,
  };
}

/**
 * Clear pending token
 */
export function clearPendingToken(state: CalculatorState): CalculatorState {
  return {
    ...state,
    pendingToken: null,
  };
}

/**
 * Edit a time range by index
 * If start and end times are the same, delete the range instead
 */
export function editTimeRange(
  state: CalculatorState,
  index: number,
  start: TimeToken,
  end: TimeToken,
): CalculatorState {
  // Check if start and end are the same time - if so, delete the range
  const startMinutes = start.hours * 60 + start.minutes;
  const endMinutes = end.hours * 60 + end.minutes;

  if (startMinutes === endMinutes) {
    return removeTimeRange(state, index);
  }

  const oldRange = state.ranges[index];
  const newDuration = calculateDuration(start, end);
  const newRanges = [...state.ranges];

  newRanges[index] = {
    start,
    end,
    durationMinutes: newDuration,
  };

  const durationDifference = newDuration - oldRange.durationMinutes;

  return {
    ...state,
    ranges: newRanges,
    totalMinutes: Math.max(0, state.totalMinutes + durationDifference),
  };
}

/**
 * Remove a time range by index
 */
export function removeTimeRange(state: CalculatorState, index: number): CalculatorState {
  const removedRange = state.ranges[index];
  const newRanges = state.ranges.filter((_, i) => i !== index);

  return {
    ...state,
    ranges: newRanges,
    totalMinutes: Math.max(0, state.totalMinutes - removedRange.durationMinutes),
  };
}

/**
 * Clear all ranges and pending token
 */
export function clearAll(state: CalculatorState): CalculatorState {
  return {
    ranges: [],
    pendingToken: null,
    totalMinutes: 0,
  };
}

/**
 * Calculate duration between two times
 */
function calculateDuration(start: TimeToken, end: TimeToken): number {
  const startMinutes = timeTokenToMinutes(start);
  const endMinutes = timeTokenToMinutes(end);

  if (endMinutes < startMinutes) {
    // Time range crosses midnight
    return 24 * 60 - startMinutes + endMinutes;
  }

  return endMinutes - startMinutes;
}

/**
 * Process a single token:
 * - If there's no pending token, set it as pending
 * - If there's a pending token, complete the range
 */
export function processToken(state: CalculatorState, token: TimeToken): CalculatorState {
  if (!state.pendingToken) {
    return setPendingToken(state, token);
  }

  return completePendingRange(state, token);
}

/**
 * Serialize state to JSON string
 */
export function serializeState(state: CalculatorState): string {
  return JSON.stringify(state);
}

/**
 * Deserialize state from JSON string
 */
export function deserializeState(json: string): CalculatorState {
  try {
    const parsed = JSON.parse(json);
    return {
      ranges: parsed.ranges || [],
      pendingToken: parsed.pendingToken || null,
      totalMinutes: parsed.totalMinutes || 0,
    };
  } catch {
    return initialState;
  }
}
