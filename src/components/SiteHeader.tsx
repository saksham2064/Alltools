import React, { useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { BrandMark } from "@/src/components/BrandMark";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

export type ActiveRoute =
  | { view: "home" }
  | { view: "all-tools"; category?: string }
  | { view: "categories" }
  | { view: "tool"; slug: string };

interface SiteHeaderProps {
  route: ActiveRoute;
  onNavigate: (route: ActiveRoute) => void;
  onOpenSearch: () => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  route,
  onNavigate,
  onOpenSearch,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { label: string; isActive: boolean; target: ActiveRoute }[] = [
    { label: "Home", isActive: route.view === "home", target: { view: "home" } },
    {
      label: "All Tools",
      isActive: route.view === "all-tools",
      target: { view: "all-tools" },
    },
    {
      label: "Categories",
      isActive: route.view === "categories",
      target: { view: "categories" },
    },
    {
      label: "Tool Template",
      isActive: route.view === "tool",
      target: { view: "tool", slug: "compress-pdf" },
    },
  ];

  const handleNavClick = (target: ActiveRoute) => {
    onNavigate(target);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#EEE8E2] bg-[#FFFAF6]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand mark + single-line wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick({ view: "home" })}
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28B45] rounded-md py-1 cursor-pointer"
        >
          <BrandMark className="h-7 w-7 shrink-0" />
          <span className="font-display text-lg font-bold tracking-tight text-[#202020]">
            Forma
          </span>
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center gap-7"
        >
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleNavClick(item.target)}
              className={cn(
                "relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28B45] rounded-sm",
                item.isActive
                  ? "text-[#202020]"
                  : "text-[#777777] hover:text-[#202020]"
              )}
            >
              {item.label}
              {item.isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-[21px] h-[2px] bg-[#F28B45]"
                />
              )}
            </button>
          ))}
        </nav>

        {/* Zone 3: Single primary search trigger + mobile toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onOpenSearch}
            className="h-9 gap-2 px-3.5 text-sm font-normal text-[#777777] hover:text-[#202020]"
            aria-label="Search tools"
          >
            <Search className="h-4 w-4 text-[#F28B45]" aria-hidden="true" />
            <span className="hidden sm:inline">Search tools</span>
            <kbd className="hidden lg:inline-block rounded border border-[#EEE8E2] bg-[#FFFAF6] px-1.5 py-0.5 font-mono text-[11px] text-[#777777]">
              ⌘K
            </kbd>
          </Button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#EEE8E2] bg-white text-[#202020] md:hidden hover:bg-[#FAF3EC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28B45] cursor-pointer"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Responsive mobile drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-[#EEE8E2] bg-white px-4 py-3 md:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNavClick(item.target)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors cursor-pointer",
                  item.isActive
                    ? "bg-[#FEF2E9] text-[#C8601C]"
                    : "text-[#202020] hover:bg-[#FAF3EC]"
                )}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
