import React, { useMemo, useState, useEffect } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/src/components/ui/dialog";
import { CATEGORIES, TOOLS_CATALOG } from "@/src/data/toolsCatalog";
import { ToolIcon } from "@/src/components/ToolIcon";
import { ActiveRoute } from "@/src/components/SiteHeader";

interface SearchCommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (route: ActiveRoute) => void;
}

export const SearchCommandDialog: React.FC<SearchCommandDialogProps> = ({
  open,
  onOpenChange,
  onNavigate,
}) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TOOLS_CATALOG.slice(0, 6);
    return TOOLS_CATALOG.filter(
      (tool) =>
        tool.name.toLowerCase().includes(q) ||
        tool.shortDescription.toLowerCase().includes(q) ||
        tool.categoryName.toLowerCase().includes(q)
    );
  }, [query]);

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return CATEGORIES.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q)
    );
  }, [query]);

  const selectRoute = (route: ActiveRoute) => {
    onNavigate(route);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0">
        <DialogTitle className="sr-only">Search all tools and categories</DialogTitle>
        <DialogDescription className="sr-only">
          Type a tool name, file format, or category to jump straight to its workspace.
        </DialogDescription>

        <div className="flex items-center border-b border-[#EEE8E2] px-4 py-3 pr-12">
          <Search className="mr-3 h-4 w-4 shrink-0 text-[#F28B45]" aria-hidden="true" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search PDF, image resize, JSON formatter, audio..."
            className="w-full bg-transparent text-sm text-[#202020] placeholder:text-[#777777] focus:outline-none"
          />
        </div>

        <div className="max-h-[360px] overflow-y-auto p-3">
          {filteredCategories.length > 0 && (
            <div className="mb-3">
              <p className="px-2.5 py-1.5 text-xs font-medium text-[#777777]">
                Categories
              </p>
              <div className="space-y-1">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() =>
                      selectRoute({ view: "all-tools", category: cat.slug })
                    }
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[#FEF2E9] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#FAF3EC] text-[#202020]">
                        <ToolIcon name={cat.icon} className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-[#202020]">{cat.name}</p>
                        <p className="text-xs text-[#777777]">{cat.toolCount} tools</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#777777]" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="px-2.5 py-1.5 text-xs font-medium text-[#777777]">
              {query.trim() ? "Matching tools" : "Popular tools"}
            </p>
            {filteredTools.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <p className="text-sm font-medium text-[#202020]">
                  No tools match "{query}"
                </p>
                <p className="mt-1 text-xs text-[#777777]">
                  Try searching by file format like PDF, PNG, JSON, or MP3.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredTools.map((tool) => (
                  <button
                    key={tool.slug}
                    type="button"
                    onClick={() => selectRoute({ view: "tool", slug: tool.slug })}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[#FEF2E9] cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#EEE8E2] bg-white text-[#F28B45]">
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
                    <ArrowRight className="ml-3 h-4 w-4 shrink-0 text-[#777777]" aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
