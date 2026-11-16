import React from "react";
import { ArrowRight, ShieldCheck, Sliders, Upload, Zap } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ActiveRoute } from "@/src/components/SiteHeader";

interface PlatformOverviewProps {
  onNavigate: (route: ActiveRoute) => void;
}

const BENEFITS = [
  {
    icon: Zap,
    title: "No sign-up walls",
    description:
      "Open any utility and get straight to work without creating an account or verifying an email.",
  },
  {
    icon: Sliders,
    title: "Consistent controls",
    description:
      "Every tool shares the same clean workspace layout, so once you use one, you know them all.",
  },
  {
    icon: ShieldCheck,
    title: "Respectful of your files",
    description:
      "No cluttered ad banners, misleading download buttons, or hidden paywalls mid-workflow.",
  },
  {
    icon: Upload,
    title: "Clear states at every step",
    description:
      "See exact file metrics, settings previews, and readable error recovery if something looks off.",
  },
];

const THREE_STEPS = [
  {
    step: "01",
    title: "Drop or paste your input",
    description:
      "Select a file from your device, drag it into the workspace, or paste raw text directly.",
  },
  {
    step: "02",
    title: "Adjust focused settings",
    description:
      "Fine-tune only the options that matter—resolution, format, indentation, or trim length.",
  },
  {
    step: "03",
    title: "Preview and download",
    description:
      "Verify the output summary and save your finished file with one clear button.",
  },
];

export const PlatformOverview: React.FC<PlatformOverviewProps> = ({
  onNavigate,
}) => {
  return (
    <>
      {/* Why use this platform */}
      <section className="border-t border-[#EEE8E2] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#202020] sm:text-3xl">
              Built to stay out of your way
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#777777] sm:text-base">
              Most online converters bury a simple task under popups and fake buttons.
              Forma keeps every utility calm, legible, and dependable.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="border-t border-[#EEE8E2] pt-5"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#FEF2E9] text-[#F28B45]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold text-[#202020]">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#777777]">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Simple three-step usage explanation */}
      <section className="border-t border-[#EEE8E2] bg-[#FFFAF6]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-[#202020] sm:text-3xl">
                How every tool works
              </h2>
              <p className="mt-1.5 text-sm text-[#777777] sm:text-base">
                Three predictable steps from raw file to finished download.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => onNavigate({ view: "tool", slug: "compress-pdf" })}
            >
              Try the tool template
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {THREE_STEPS.map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-[#EEE8E2] bg-white p-6"
              >
                <span className="font-mono text-sm font-semibold text-[#F28B45] tabular-nums">
                  {item.step}.
                </span>
                <h3 className="mt-3 font-display text-base font-semibold text-[#202020]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#777777]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
