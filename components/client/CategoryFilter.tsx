"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

// ─── Category Filter ──────────────────────────────────────────────────────────

interface CategoryFilterProps {
  categories: Category[];
  selected: string;
  onChange: (slug: string) => void;
}

export function CategoryFilter({ categories, selected, onChange }: CategoryFilterProps) {
  const allCategories = [{ id: "all", name: "All", slug: "all", image: "🛒" }, ...categories];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {allCategories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.slug)}
          className={cn(
            "flex-shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150",
            selected === cat.slug
              ? "bg-brand-600 text-white shadow-sm"
              : "bg-white text-gray-600 border border-gray-200 hover:border-brand-200 hover:text-brand-600"
          )}
        >
          {(cat as Category & { image?: string }).image && (
            <span className="mr-1.5">{(cat as Category & { image?: string }).image}</span>
          )}
          {cat.name}
        </button>
      ))}
    </div>
  );
}

// ─── Search Bar ───────────────────────────────────────────────────────────────

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search products…",
}: SearchBarProps) {
  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-xl border border-gray-200 bg-white pl-10 pr-10 py-2.5 text-sm",
          "text-gray-900 placeholder:text-gray-400",
          "focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20",
          "transition-colors duration-150"
        )}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
