/**
 * Date formatting utilities for Australian date format (DD-MM-YYYY)
 */

/**
 * Converts a Date object or date string to Australian format (DD-MM-YYYY)
 * @param date - Date object, string, or null
 * @returns Formatted date string in DD-MM-YYYY format, or empty string if invalid
 */
export function toAustralianDate(date: Date | string | null | undefined): string {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "";

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();

  return `${day}-${month}-${year}`;
}

/**
 * Converts a Date object or date string to Australian format with time (DD-MM-YYYY HH:MM)
 * @param date - Date object, string, or null
 * @returns Formatted date string in DD-MM-YYYY HH:MM format, or empty string if invalid
 */
export function toAustralianDateTime(date: Date | string | null | undefined): string {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "";

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

/**
 * Parses a date value that might be a Date object, string, or other format
 * Returns a valid Date object or null
 * @param dateValue - The date value to parse
 * @returns Date object or null if invalid
 */
export function parseDate(dateValue: Date | string | null | undefined): Date | null {
  if (!dateValue) return null;

  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }

  // Handle string dates
  const dateStr = String(dateValue);
  const parsedDate = new Date(dateStr);

  return isNaN(parsedDate.getTime()) ? null : parsedDate;
}

/**
 * Converts Australian format date string (DD-MM-YYYY) to a Date object
 * @param dateStr - Date string in DD-MM-YYYY format
 * @returns Date object or null if invalid
 */
export function fromAustralianDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

  const date = new Date(year, month, day);
  return isNaN(date.getTime()) ? null : date;
}
