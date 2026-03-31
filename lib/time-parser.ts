/**
 * Time Parser Utility
 * Parses various time formats and validates them
 */

export interface TimeToken {
  hours: number;
  minutes: number;
  original: string;
}

/**
 * Normalizes a time token string and validates it
 * Supports formats: 0936, 9:36, 9 36, 936, etc.
 */
export function parseTimeToken(input: string): TimeToken | null {
  if (!input) return null;

  const trimmed = input.trim();

  // Remove common separators: colon, space
  const normalized = trimmed.replace(/[:\s]/g, "");

  // Must be a number
  if (!/^\d+$/.test(normalized)) {
    return null;
  }

  // Handle different lengths
  let hours = 0;
  let minutes = 0;

  if (normalized.length === 1) {
    // "5" -> 5 hours 0 minutes
    hours = parseInt(normalized, 10);
  } else if (normalized.length === 2) {
    // "12" -> 12 hours 0 minutes
    hours = parseInt(normalized, 10);
  } else if (normalized.length === 3) {
    // "936" -> 9 hours 36 minutes
    hours = parseInt(normalized[0], 10);
    minutes = parseInt(normalized.slice(1), 10);
  } else if (normalized.length === 4) {
    // "0936" -> 09 hours 36 minutes
    hours = parseInt(normalized.slice(0, 2), 10);
    minutes = parseInt(normalized.slice(2), 10);
  } else if (normalized.length > 4) {
    // Take last 4 digits: "20936" -> 09:36
    const lastFour = normalized.slice(-4);
    hours = parseInt(lastFour.slice(0, 2), 10);
    minutes = parseInt(lastFour.slice(2), 10);
  }

  // Validate time values
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return {
    hours,
    minutes,
    original: trimmed,
  };
}

/**
 * Extracts all time tokens from input string
 * Tokens are separated by separators like -, ~, ,
 * Returns array of time token strings
 */
export function extractTimeTokens(input: string): string[] {
  // Split by range separators (-, ~) and list separator (,)
  // But we need to identify which are range separators and which are list separators

  const tokens: string[] = [];
  let currentToken = "";

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (char === "," || char === "\n") {
      // List separator - end current group
      if (currentToken.trim()) {
        tokens.push(currentToken.trim());
      }
      currentToken = "";
    } else if (char === "-" || char === "~") {
      // Could be range separator - check context
      // If we have content before and the next char isn't whitespace or another separator
      const hasContentBefore = currentToken.trim().length > 0;
      const nextChar = i + 1 < input.length ? input[i + 1] : "";
      const hasContentAfter = nextChar && nextChar !== " " && nextChar !== "," && nextChar !== "\n";

      if (hasContentBefore && hasContentAfter) {
        // This is a range separator
        currentToken += char;
      } else {
        // This might be a number sign or standalone
        currentToken += char;
      }
    } else {
      currentToken += char;
    }
  }

  if (currentToken.trim()) {
    tokens.push(currentToken.trim());
  }

  return tokens;
}

/**
 * Parses a range string like "9:36-18:45" or "0936~1800"
 * Returns an array of two TimeTokens if valid, null otherwise
 */
export function parseTimeRange(rangeStr: string): [TimeToken, TimeToken] | null {
  // Split by range separator (-, ~)
  const parts = rangeStr.split(/[-~]/).map((p) => p.trim());

  if (parts.length !== 2) {
    return null;
  }

  const [startStr, endStr] = parts;
  const startTime = parseTimeToken(startStr);
  const endTime = parseTimeToken(endStr);

  if (!startTime || !endTime) {
    return null;
  }

  return [startTime, endTime];
}

/**
 * Converts TimeToken to minutes for calculation
 */
export function timeTokenToMinutes(token: TimeToken): number {
  return token.hours * 60 + token.minutes;
}

/**
 * Converts minutes back to TimeToken
 */
export function minutesToTimeToken(minutes: number): TimeToken {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return {
    hours,
    minutes: mins,
    original: `${hours}:${mins.toString().padStart(2, "0")}`,
  };
}

/**
 * Formats a TimeToken as HH:MM string
 */
export function formatTimeToken(token: TimeToken): string {
  return `${token.hours.toString().padStart(2, "0")}:${token.minutes.toString().padStart(2, "0")}`;
}

/**
 * Calculate duration between two times (end - start)
 * Both times are on the same day
 */
export function calculateDuration(start: TimeToken, end: TimeToken): number {
  const startMinutes = timeTokenToMinutes(start);
  const endMinutes = timeTokenToMinutes(end);

  if (endMinutes < startMinutes) {
    // Time range crosses midnight
    return 24 * 60 - startMinutes + endMinutes;
  }

  return endMinutes - startMinutes;
}

/**
 * Formats minutes as HH:MM format
 */
export function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * Formats minutes as "X Hour Y Minutes (X.XX Hours)"
 */
export function formatDurationWithDecimal(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const decimalHours = (totalMinutes / 60).toFixed(2);

  return `${hours} Hour ${minutes} Minutes (${decimalHours} Hours)`;
}

/**
 * Returns BNF notation for supported time formats
 */
export function getFormatBNF(): string {
  return `
<time_input>       ::= <time_value> ("," <time_value>)*
<time_value>       ::= <time_token> | <time_range>
<time_token>       ::= <numeric_time> | <colon_time> | <space_time>
<time_range>       ::= <time_token> <range_sep> <time_token>
<numeric_time>     ::= <digit>{1,4}
<colon_time>       ::= <digit>{1,2} ":" <digit>{1,2}
<space_time>       ::= <digit>{1,2} " " <digit>{1,2}
<range_sep>        ::= "-" | "~"
<digit>            ::= "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
`.trim();
}
