import { useEffect, useState } from "react";
import { SiteHeader, ActiveRoute } from "@/src/components/SiteHeader";
import { SiteFooter } from "@/src/components/SiteFooter";
import { SearchCommandDialog } from "@/src/components/SearchCommandDialog";
import { HeroSection } from "@/src/components/home/HeroSection";
import { CategoryGrid } from "@/src/components/home/CategoryGrid";
import { ToolCollections } from "@/src/components/home/ToolCollections";
import { PlatformOverview } from "@/src/components/home/PlatformOverview";
import { AllToolsView } from "@/src/components/tools/AllToolsView";
import { ToolPageTemplate } from "@/src/components/tools/ToolPageTemplate";

export function App() {
  const [route, setRoute] = useState<ActiveRoute>({ view: "home" });
  const [searchOpen, setSearchOpen] = useState(false);

  const handleNavigate = (nextRoute: ActiveRoute) => {
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFAF6] text-[#202020]">
      <SiteHeader
        route={route}
        onNavigate={handleNavigate}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <main className="flex-1">
        {route.view === "home" && (
          <>
            <HeroSection onNavigate={handleNavigate} />
            <CategoryGrid onNavigate={handleNavigate} />
            <ToolCollections onNavigate={handleNavigate} />
            <PlatformOverview onNavigate={handleNavigate} />
          </>
        )}

        {route.view === "all-tools" && (
          <AllToolsView
            mode="all-tools"
            initialCategory={route.category ?? "all"}
            onNavigate={handleNavigate}
          />
        )}

        {route.view === "categories" && (
          <AllToolsView mode="categories" onNavigate={handleNavigate} />
        )}

        {route.view === "tool" && (
          <ToolPageTemplate slug={route.slug} onNavigate={handleNavigate} />
        )}
      </main>

      <SiteFooter onNavigate={handleNavigate} />

      <SearchCommandDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default App;
