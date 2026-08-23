import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names, letting later Tailwind utilities win over earlier ones
 * of the same type (so a caller's `px-8` overrides a component's `px-4`
 * instead of both landing in the class list).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
