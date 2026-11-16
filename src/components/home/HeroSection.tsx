import React, { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, FileText, Search, SlidersHorizontal } from "lucide-react";
import {
  POPULAR_SEARCH_SUGGESTIONS,
  TOOLS_CATALOG,
} from "@/src/data/toolsCatalog";
import { ToolIcon } from "@/src/components/ToolIcon";
import { ActiveRoute } from "@/src/components/SiteHeader";
import { Button } from "@/src/components/ui/button";

interface HeroSectionProps {
  onNavigate: (route: ActiveRoute) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const quickMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return TOOLS_CATALOG.filter(
      (tool) =>
        tool.name.toLowerCase().includes(q) ||
        tool.shortDescription.toLowerCase().includes(q) ||
        tool.categoryName.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickMatches.length > 0) {
      onNavigate({ view: "tool", slug: quickMatches[0].slug });
    } else if (query.trim()) {
      onNavigate({ view: "all-tools" });
    } else {
      onNavigate({ view: "tool", slug: "compress-pdf" });
    }
  };

  return (
    <section className="border-b border-[#EEE8E2] bg-[#FFFAF6]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Left column: Headline, supporting copy, search, suggestions */}
          <div className="lg:col-span-7">
            <h1
              className="font-display font-bold tracking-[-0.025em] text-[#202020] [text-wrap:balance]"
              style={{ fontSize: "clamp(2.25rem, 4.3vw, 3.5rem)", lineHeight: 1.08 }}
            >
              Simple tools.
              <br />
              Brilliantly useful.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#777777] sm:text-lg">
              Everything you need to convert, edit, organize, and create — all in one place.
            </p>

            {/* Prominent search input */}
            <div className="relative mt-8 max-w-xl">
              <form
                onSubmit={handleSubmit}
                className="flex items-center rounded-xl border border-[#EEE8E2] bg-white p-1.5 shadow-[0_2px_10px_rgba(32,32,32,0.03)] transition-colors focus-within:border-[#F28B45]"
              >
                <Search
                  className="ml-3 h-5 w-5 shrink-0 text-[#777777]"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={query}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 160)}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What do you want to do today?"
                  aria-label="What do you want to do today?"
                  className="h-11 w-full bg-transparent px-3.5 text-sm text-[#202020] placeholder:text-[#777777] focus:outline-none sm:text-base"
                />
                <Button type="submit" size="default" className="h-11 px-5">
                  Find tool
                </Button>
              </form>

              {/* Live search suggestions dropdown */}
              {isFocused && query.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 rounded-xl border border-[#EEE8E2] bg-white p-2 shadow-[0_12px_32px_rgba(32,32,32,0.08)]">
                  {quickMatches.length === 0 ? (
                    <div className="px-3 py-4 text-center text-sm text-[#777777]">
                      No direct tool match for "{query}".{" "}
                      <button
                        type="button"
                        onMouseDown={() => onNavigate({ view: "all-tools" })}
                        className="font-medium text-[#C8601C] underline underline-offset-2 cursor-pointer"
                      >
                        Browse all tools
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#EEE8E2]">
                      {quickMatches.map((tool) => (
                        <button
                          key={tool.slug}
                          type="button"
                          onMouseDown={() =>
                            onNavigate({ view: "tool", slug: tool.slug })
                          }
                          className="flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-[#FEF2E9] first:rounded-t-lg last:rounded-b-lg cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#FAF3EC] text-[#F28B45]">
                              <ToolIcon name={tool.icon} className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-[#202020]">
                                {tool.name}
                              </p>
                              <p className="truncate text-xs text-[#777777]">
                                {tool.categoryName} · {tool.shortDescription}
                              </p>
                            </div>
                          </div>
                          <ArrowRight
                            className="ml-3 h-4 w-4 shrink-0 text-[#777777]"
                            aria-hidden="true"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Popular search suggestions */}
            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
              <span className="text-[#777777] mr-1">Popular:</span>
              {POPULAR_SEARCH_SUGGESTIONS.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => onNavigate({ view: "tool", slug: item.slug })}
                  className="rounded-md border border-[#EEE8E2] bg-white px-2.5 py-1 text-xs font-medium text-[#202020] transition-colors hover:border-[#F28B45] hover:bg-[#FEF2E9] hover:text-[#C8601C] cursor-pointer whitespace-nowrap"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right column: Small, tasteful architectural visual element */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-[#EEE8E2] bg-white p-6 shadow-[0_4px_20px_rgba(32,32,32,0.03)]">
              <div className="flex items-center justify-between border-b border-[#EEE8E2] pb-4">
                <span className="text-xs font-medium text-[#777777]">
                  Workspace Preview
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onNavigate({ view: "tool", slug: "compress-pdf" })
                  }
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#C8601C] hover:underline cursor-pointer"
                >
                  Open template
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {/* Step 1 preview row */}
                <div className="flex items-center justify-between rounded-lg border border-dashed border-[#E2D8CE] bg-[#FFFAF6] px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FEF2E9] text-[#F28B45]">
                      <FileText className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#202020]">
                        Q4-Roadmap-Deck.pdf
                      </p>
                      <p className="text-xs text-[#777777] tabular-nums">
                        18.4 MB · 24 pages
                      </p>
                    </div>
                  </div>
                  <span className="ml-2 text-xs font-medium text-[#777777] shrink-0">
                    Input
                  </span>
                </div>

                {/* Step 2 preview row */}
                <div className="flex items-center justify-between rounded-lg border border-[#EEE8E2] bg-white px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FAF3EC] text-[#202020]">
                      <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[#202020]">
                        Balanced compression
                      </p>
                      <p className="text-xs text-[#777777] tabular-nums">
                        150 DPI · Clean metadata
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-[#777777]">
                    Preset
                  </span>
                </div>

                {/* Step 3 preview row */}
                <div className="flex items-center justify-between rounded-lg border border-[#FADAC2] bg-[#FEF2E9] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F28B45] text-white">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[#202020]">
                        Ready to download
                      </p>
                      <p className="text-xs text-[#777777] tabular-nums">
                        4.2 MB · 77% smaller
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#C8601C]">
                    Output
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
