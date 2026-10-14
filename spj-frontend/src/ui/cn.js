/**
 * cn — className merger
 * Menggabungkan className dengan aman, menghindari duplikasi Tailwind.
 *
 * Contoh:
 *   cn("px-4 py-2", "px-6")           → "py-2 px-6"
 *   cn("bg-primary", isActive && "bg-primary-hover") → kondisional
 *
 * @param  {...any} inputs - string, array, objek kondisional
 * @returns {string}
 */
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
