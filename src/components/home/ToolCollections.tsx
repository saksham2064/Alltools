import React from "react";
import { ArrowUpRight, Clock, TrendingUp } from "lucide-react";
import { TOOLS_CATALOG } from "@/src/data/toolsCatalog";
import { ToolIcon } from "@/src/components/ToolIcon";
import { ActiveRoute } from "@/src/components/SiteHeader";

interface ToolCollectionsProps {
  onNavigate: (route: ActiveRoute) => void;
}

export const ToolCollections: React.FC<ToolCollectionsProps> = ({
  onNavigate,
}) => {
  const popularTools = TOOLS_CATALOG.filter((t) => t.isPopular);
  const trendingTools = TOOLS_CATALOG.filter((t) => t.isTrending).slice(0, 4);
  const recentTools = TOOLS_CATALOG.filter((t) => t.isRecent).slice(0, 4);

  return (
    <>
      {/* Popular Tools Grid */}
      <section className="border-t border-[#EEE8E2] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-[#202020] sm:text-3xl">
                Popular tools
              </h2>
              <p className="mt-1.5 text-sm text-[#777777] sm:text-base">
                The utilities people reach for most to finish everyday tasks quickly.
              </p>
            </div>
            <span className="text-xs font-medium text-[#777777] tabular-nums">
              {popularTools.length} featured workspaces
            </span>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularTools.map((tool) => (
              <button
                key={tool.slug}
                type="button"
                onClick={() => onNavigate({ view: "tool", slug: tool.slug })}
                className="group flex flex-col justify-between rounded-xl border border-[#EEE8E2] bg-[#FFFAF6] p-5 text-left transition-all duration-150 hover:border-[#F28B45]/60 hover:bg-white hover:shadow-[0_6px_18px_rgba(32,32,32,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28B45] cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#EEE8E2] bg-white text-[#F28B45] transition-colors group-hover:border-[#FADAC2] group-hover:bg-[#FEF2E9]">
                      <ToolIcon name={tool.icon} className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-medium text-[#777777]">
                      {tool.categoryName}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-base font-semibold text-[#202020] group-hover:text-[#C8601C] transition-colors">
                    {tool.name}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#777777]">
                    {tool.shortDescription}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#EEE8E2] pt-3 text-xs text-[#777777]">
                  <span>{tool.acceptedFormatsLabel}</span>
                  <ArrowUpRight
                    className="h-4 w-4 text-[#777777] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#F28B45]"
                    aria-hidden="true"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Trending & Recently Added Tools */}
      <section className="border-t border-[#EEE8E2] bg-[#FFFAF6]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Trending Tools */}
            <div className="rounded-xl border border-[#EEE8E2] bg-white p-6">
              <div className="flex items-center justify-between border-b border-[#EEE8E2] pb-4">
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="h-4 w-4 text-[#F28B45]" aria-hidden="true" />
                  <h2 className="font-display text-lg font-semibold text-[#202020]">
                    Trending tools
                  </h2>
                </div>
                <span className="text-xs text-[#777777]">This week</span>
              </div>

              <div className="divide-y divide-[#EEE8E2]">
                {trendingTools.map((tool) => (
                  <button
                    key={tool.slug}
                    type="button"
                    onClick={() => onNavigate({ view: "tool", slug: tool.slug })}
                    className="group flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:bg-[#FFFAF6] -mx-2 px-2 rounded-lg cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FEF2E9] text-[#F28B45]">
                        <ToolIcon name={tool.icon} className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-display text-sm font-semibold text-[#202020] group-hover:text-[#C8601C]">
                          {tool.name}
                        </p>
                        <p className="truncate text-xs text-[#777777]">
                          {tool.categoryName} · {tool.trendLabel ?? tool.shortDescription}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0 text-[#777777] group-hover:text-[#F28B45]"
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Recently Added Tools */}
            <div className="rounded-xl border border-[#EEE8E2] bg-white p-6">
              <div className="flex items-center justify-between border-b border-[#EEE8E2] pb-4">
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-[#F28B45]" aria-hidden="true" />
                  <h2 className="font-display text-lg font-semibold text-[#202020]">
                    Recently added
                  </h2>
                </div>
                <span className="text-xs text-[#777777]">Latest releases</span>
              </div>

              <div className="divide-y divide-[#EEE8E2]">
                {recentTools.map((tool) => (
                  <button
                    key={tool.slug}
                    type="button"
                    onClick={() => onNavigate({ view: "tool", slug: tool.slug })}
                    className="group flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:bg-[#FFFAF6] -mx-2 px-2 rounded-lg cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#EEE8E2] bg-[#FFFAF6] text-[#202020] group-hover:border-[#FADAC2] group-hover:text-[#F28B45]">
                        <ToolIcon name={tool.icon} className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-display text-sm font-semibold text-[#202020] group-hover:text-[#C8601C]">
                          {tool.name}
                        </p>
                        <p className="truncate text-xs text-[#777777]">
                          {tool.categoryName} · {tool.addedLabel ?? "New"}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0 text-[#777777] group-hover:text-[#F28B45]"
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
