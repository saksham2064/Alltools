import React from "react";
import { BrandMark } from "@/src/components/BrandMark";
import { CATEGORIES, TOOLS_CATALOG } from "@/src/data/toolsCatalog";
import { ActiveRoute } from "@/src/components/SiteHeader";

interface SiteFooterProps {
  onNavigate: (route: ActiveRoute) => void;
}

export const SiteFooter: React.FC<SiteFooterProps> = ({ onNavigate }) => {
  const popularLinks = TOOLS_CATALOG.filter((t) => t.isPopular).slice(0, 5);

  return (
    <footer className="border-t border-[#EEE8E2] bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand summary */}
          <div className="md:col-span-4">
            <button
              type="button"
              onClick={() => onNavigate({ view: "home" })}
              className="flex items-center gap-2.5 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28B45] rounded-md"
            >
              <BrandMark className="h-7 w-7" />
              <span className="font-display text-lg font-bold tracking-tight text-[#202020]">
                Forma
              </span>
            </button>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#777777]">
              A calm, focused utility workspace for everyday documents, images,
              audio, video, text, and developer tasks.
            </p>
          </div>

          {/* Categories column */}
          <div className="md:col-span-3">
            <h4 className="font-display text-sm font-semibold text-[#202020]">
              Categories
            </h4>
            <ul className="mt-4 space-y-2.5">
              {CATEGORIES.slice(0, 6).map((category) => (
                <li key={category.slug}>
                  <button
                    type="button"
                    onClick={() =>
                      onNavigate({ view: "all-tools", category: category.slug })
                    }
                    className="text-sm text-[#777777] transition-colors hover:text-[#202020] cursor-pointer"
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Tools column */}
          <div className="md:col-span-3">
            <h4 className="font-display text-sm font-semibold text-[#202020]">
              Popular Tools
            </h4>
            <ul className="mt-4 space-y-2.5">
              {popularLinks.map((tool) => (
                <li key={tool.slug}>
                  <button
                    type="button"
                    onClick={() => onNavigate({ view: "tool", slug: tool.slug })}
                    className="text-sm text-[#777777] transition-colors hover:text-[#202020] cursor-pointer"
                  >
                    {tool.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform column */}
          <div className="md:col-span-2">
            <h4 className="font-display text-sm font-semibold text-[#202020]">
              Platform
            </h4>
            <ul className="mt-4 space-y-2.5">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate({ view: "home" })}
                  className="text-sm text-[#777777] transition-colors hover:text-[#202020] cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate({ view: "all-tools" })}
                  className="text-sm text-[#777777] transition-colors hover:text-[#202020] cursor-pointer"
                >
                  All Tools
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate({ view: "categories" })}
                  className="text-sm text-[#777777] transition-colors hover:text-[#202020] cursor-pointer"
                >
                  Categories
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    onNavigate({ view: "tool", slug: "compress-pdf" })
                  }
                  className="text-sm text-[#777777] transition-colors hover:text-[#202020] cursor-pointer"
                >
                  Tool Page Template
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[#EEE8E2] pt-7 sm:flex-row sm:items-center">
          <p className="text-xs text-[#777777]">
            © {new Date().getFullYear()} Forma Utilities. All rights reserved.
          </p>
          <p className="text-xs text-[#777777]">
            No account required · Designed for clear everyday workflows
          </p>
        </div>
      </div>
    </footer>
  );
};
