// src/lib/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export function convertMinutesToTimeFormat(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const seconds = 0; // If you want to set seconds as 00 for now.

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
}

export function capitalize(word: string): string {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function formatReadableDate(dateString, format = "full") {
  const date = new Date(dateString);

  let options = {};

  switch (format) {
    case "date-only":
      options = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      break;
    case "time-only":
      options = {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      };
      break;
    case "full":
    default:
      options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      };
  }

  return date.toLocaleString("en-US", options);
}
