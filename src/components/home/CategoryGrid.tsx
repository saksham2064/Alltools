import React from "react";
import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/src/data/toolsCatalog";
import { ToolIcon } from "@/src/components/ToolIcon";
import { ActiveRoute } from "@/src/components/SiteHeader";

interface CategoryGridProps {
  onNavigate: (route: ActiveRoute) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onNavigate }) => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#202020] sm:text-3xl">
            Browse by category
          </h2>
          <p className="mt-1.5 text-sm text-[#777777] sm:text-base">
            Eight focused toolkits organized by the files and formats you work with daily.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate({ view: "all-tools" })}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#C8601C] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
        >
          View all tools
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((category) => (
          <button
            key={category.slug}
            type="button"
            onClick={() =>
              onNavigate({ view: "all-tools", category: category.slug })
            }
            className="group flex flex-col justify-between rounded-xl border border-[#EEE8E2] bg-white p-5 text-left transition-all duration-150 hover:border-[#F28B45]/60 hover:shadow-[0_6px_18px_rgba(32,32,32,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28B45] cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FEF2E9] text-[#F28B45] transition-colors group-hover:bg-[#F28B45] group-hover:text-white">
                  <ToolIcon name={category.icon} className="h-5 w-5" />
                </span>
                <span className="text-xs font-medium text-[#777777] tabular-nums">
                  {category.toolCount} tools
                </span>
              </div>

              <h3 className="mt-4 font-display text-base font-semibold text-[#202020]">
                {category.name}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#777777]">
                {category.description}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#777777] transition-colors group-hover:text-[#C8601C]">
              <span>Explore category</span>
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
