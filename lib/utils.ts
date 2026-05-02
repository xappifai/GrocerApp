import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conflict resolution */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format currency in PKR */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format date */
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));
}

/** Truncate string */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

/** Get initials from name */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Debounce function */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

/** Order status color mapping */
export function getStatusColor(status: string): string {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "PROCESSING":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "DELIVERED":
      return "bg-green-100 text-green-700 border-green-200";
    case "CANCELLED":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

/** Order status label */
export function getStatusLabel(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

/** Image fallback URL */
export function imageUrl(url?: string): string {
  if (!url || url.trim() === "") {
    return "https://placehold.co/400x300/dcfce7/15803d?text=Product";
  }
  return url;
}
