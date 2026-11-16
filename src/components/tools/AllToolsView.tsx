import React, { useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, Search, X } from "lucide-react";
import { CATEGORIES, TOOLS_CATALOG } from "@/src/data/toolsCatalog";
import { ToolIcon } from "@/src/components/ToolIcon";
import { ActiveRoute } from "@/src/components/SiteHeader";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

interface AllToolsViewProps {
  mode: "all-tools" | "categories";
  initialCategory?: string;
  onNavigate: (route: ActiveRoute) => void;
}

export const AllToolsView: React.FC<AllToolsViewProps> = ({
  mode,
  initialCategory = "all",
  onNavigate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");

  React.useEffect(() => {
    setSelectedCategory(initialCategory || "all");
  }, [initialCategory]);

  const filteredTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return TOOLS_CATALOG.filter((tool) => {
      const matchesCat =
        selectedCategory === "all" || tool.categorySlug === selectedCategory;
      const matchesSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.shortDescription.toLowerCase().includes(q) ||
        tool.categoryName.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  if (mode === "categories") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[#777777]">
          <button
            type="button"
            onClick={() => onNavigate({ view: "home" })}
            className="hover:text-[#202020] cursor-pointer"
          >
            Home
          </button>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-[#202020]">Categories</span>
        </nav>

        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#202020] sm:text-4xl">
            All tool categories
          </h1>
          <p className="mt-2.5 text-base leading-relaxed text-[#777777]">
            Explore eight organized utility suites built with the same calm,
            predictable workspace layout.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category) => {
            const categoryTools = TOOLS_CATALOG.filter(
              (t) => t.categorySlug === category.slug
            );
            return (
              <div
                key={category.slug}
                className="flex flex-col justify-between rounded-xl border border-[#EEE8E2] bg-white p-6 transition-all duration-150 hover:border-[#F28B45]/60 hover:shadow-[0_6px_18px_rgba(32,32,32,0.04)]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#FEF2E9] text-[#F28B45]">
                      <ToolIcon name={category.icon} className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-medium text-[#777777] tabular-nums">
                      {category.toolCount} tools
                    </span>
                  </div>

                  <h2 className="mt-4 font-display text-lg font-semibold text-[#202020]">
                    {category.name}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#777777]">
                    {category.description}
                  </p>

                  {categoryTools.length > 0 && (
                    <ul className="mt-4 space-y-1.5 border-t border-[#EEE8E2] pt-3.5">
                      {categoryTools.map((tool) => (
                        <li key={tool.slug}>
                          <button
                            type="button"
                            onClick={() =>
                              onNavigate({ view: "tool", slug: tool.slug })
                            }
                            className="flex w-full items-center justify-between text-left text-xs font-medium text-[#202020] hover:text-[#C8601C] cursor-pointer py-0.5"
                          >
                            <span className="truncate">{tool.name}</span>
                            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#777777]" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onNavigate({ view: "all-tools", category: category.slug })
                  }
                  className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#C8601C] hover:underline cursor-pointer"
                >
                  <span>Browse {category.name}</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[#777777]">
        <button
          type="button"
          onClick={() => onNavigate({ view: "home" })}
          className="hover:text-[#202020] cursor-pointer"
        >
          Home
        </button>
        <span aria-hidden="true">/</span>
        <span className="font-medium text-[#202020]">All Tools</span>
      </nav>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#202020] sm:text-4xl">
            All tools
          </h1>
          <p className="mt-2 max-w-xl text-base text-[#777777]">
            Select any utility below to open its focused workspace template.
          </p>
        </div>

        {/* Search filter */}
        <div className="relative w-full lg:w-80">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777777]"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter tools by name or format..."
            aria-label="Filter tools"
            className="h-11 w-full rounded-lg border border-[#EEE8E2] bg-white pl-10 pr-9 text-sm text-[#202020] placeholder:text-[#777777] focus:border-[#F28B45] focus:outline-none focus:ring-2 focus:ring-[#F28B45]/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear filter"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#777777] hover:text-[#202020] cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Category Filter Bar */}
      <div
        role="tablist"
        aria-label="Filter tools by category"
        className="mt-8 flex flex-wrap items-center gap-2 border-b border-[#EEE8E2] pb-5"
      >
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === "all"}
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "rounded-lg px-3.5 py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer",
            selectedCategory === "all"
              ? "bg-[#F28B45] text-white"
              : "border border-[#EEE8E2] bg-white text-[#777777] hover:text-[#202020]"
          )}
        >
          All Categories
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            role="tab"
            aria-selected={selectedCategory === cat.slug}
            onClick={() => setSelectedCategory(cat.slug)}
            className={cn(
              "rounded-lg px-3.5 py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer",
              selectedCategory === cat.slug
                ? "bg-[#F28B45] text-white"
                : "border border-[#EEE8E2] bg-white text-[#777777] hover:text-[#202020]"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Results grid or empty state */}
      {filteredTools.length === 0 ? (
        <div className="mt-10 rounded-xl border border-[#EEE8E2] bg-white p-12 text-center">
          <p className="font-display text-lg font-semibold text-[#202020]">
            No matching tools found
          </p>
          <p className="mt-1.5 text-sm text-[#777777]">
            No tools matched "{searchQuery}" in this category.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-5"
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
          >
            Reset filters
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool) => (
            <button
              key={tool.slug}
              type="button"
              onClick={() => onNavigate({ view: "tool", slug: tool.slug })}
              className="group flex flex-col justify-between rounded-xl border border-[#EEE8E2] bg-white p-5 text-left transition-all duration-150 hover:border-[#F28B45]/60 hover:shadow-[0_6px_18px_rgba(32,32,32,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28B45] cursor-pointer"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FEF2E9] text-[#F28B45] transition-colors group-hover:bg-[#F28B45] group-hover:text-white">
                    <ToolIcon name={tool.icon} className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-medium text-[#777777]">
                    {tool.categoryName}
                  </span>
                </div>

                <h2 className="mt-4 font-display text-base font-semibold text-[#202020] group-hover:text-[#C8601C]">
                  {tool.name}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-[#777777]">
                  {tool.shortDescription}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#EEE8E2] pt-3 text-xs text-[#777777]">
                <span>{tool.acceptedFormatsLabel}</span>
                <ArrowUpRight
                  className="h-4 w-4 text-[#777777] group-hover:text-[#F28B45]"
                  aria-hidden="true"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
