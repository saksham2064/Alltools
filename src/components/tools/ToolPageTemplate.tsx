import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeftRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  Download,
  FileCheck2,
  Loader2,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
  UploadCloud,
} from "lucide-react";
import {
  TOOLS_CATALOG,
  ToolDefinition,
  getToolBySlug,
} from "@/src/data/toolsCatalog";
import {
  CalculatorInputs,
  ProcessedToolResult,
  UNIT_GROUPS,
  UnitCategory,
  UnitConverterInputs,
  convertUnitValue,
  createSampleFileForTool,
  formatBytes,
  runRealToolProcessor,
} from "@/src/lib/toolProcessors";
import { ToolIcon } from "@/src/components/ToolIcon";
import { ActiveRoute } from "@/src/components/SiteHeader";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Slider } from "@/src/components/ui/slider";
import { Switch } from "@/src/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { cn } from "@/src/lib/utils";

type WorkspaceState = "empty" | "processing" | "success" | "error";

interface ToolPageTemplateProps {
  slug: string;
  onNavigate: (route: ActiveRoute) => void;
}

export const ToolPageTemplate: React.FC<ToolPageTemplateProps> = ({
  slug,
  onNavigate,
}) => {
  const tool: ToolDefinition = getToolBySlug(slug);

  const [workspaceState, setWorkspaceState] = useState<WorkspaceState>("empty");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [textValue, setTextValue] = useState<string>("");
  const [calcInputs, setCalcInputs] = useState<CalculatorInputs>({
    initial: 5000,
    monthly: 350,
    annualRate: 6.5,
  });
  const [unitInputs, setUnitInputs] = useState<UnitConverterInputs>({
    category: "length",
    value: 10,
    fromUnit: "km",
    toUnit: "mi",
  });
  const [isDragging, setIsDragging] = useState(false);
  const [settingsValues, setSettingsValues] = useState<
    Record<string, string | number | boolean>
  >({});
  const [realResult, setRealResult] = useState<ProcessedToolResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const revokePreviewUrls = (res: ProcessedToolResult | null) => {
    if (res?.previewImageUrl) URL.revokeObjectURL(res.previewImageUrl);
    if (res?.previewAudioUrl) URL.revokeObjectURL(res.previewAudioUrl);
  };

  // Initialize default settings whenever tool changes
  useEffect(() => {
    const defaults: Record<string, string | number | boolean> = {};
    tool.settings.forEach((setting) => {
      defaults[setting.id] = setting.defaultValue;
    });
    setSettingsValues(defaults);
    setWorkspaceState("empty");
    setSelectedFiles([]);
    setTextValue("");
    setErrorMessage(null);
    setActionFeedback(null);
    setCopiedSummary(false);
    setRealResult((prev) => {
      revokePreviewUrls(prev);
      return null;
    });
  }, [tool]);

  const handleSettingChange = (id: string, value: string | number | boolean) => {
    setSettingsValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileSelect = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const incoming = Array.from(fileList);
    if (tool.inputType === "multi-file") {
      setSelectedFiles((prev) => [...prev, ...incoming]);
    } else {
      setSelectedFiles([incoming[0]]);
    }
    setWorkspaceState("empty");
    setErrorMessage(null);
    setActionFeedback(null);
  };

  const handleLoadSample = async () => {
    setErrorMessage(null);
    setActionFeedback(null);
    if (tool.inputType === "text") {
      setTextValue(tool.sampleTextInput ?? "");
    } else if (tool.inputType === "file" || tool.inputType === "multi-file") {
      if (tool.isLive) {
        const samples = await createSampleFileForTool(tool.slug);
        setSelectedFiles(samples);
      } else {
        // Preview placeholder file for template-only tools
        const dummy = new File(["sample"], tool.sampleFileName, {
          type: "application/octet-stream",
        });
        setSelectedFiles([dummy]);
      }
    }
    setWorkspaceState("empty");
  };

  const handlePrimaryAction = async () => {
    setActionFeedback(null);
    setErrorMessage(null);

    if (!tool.isLive) {
      setWorkspaceState("processing");
      return;
    }

    let filesToUse = selectedFiles;
    let textToUse = textValue;

    // Auto-populate sample if user clicks action immediately with empty file/text input
    if (
      (tool.inputType === "file" || tool.inputType === "multi-file") &&
      filesToUse.length === 0
    ) {
      filesToUse = await createSampleFileForTool(tool.slug);
      setSelectedFiles(filesToUse);
    } else if (tool.inputType === "text" && !textToUse.trim()) {
      textToUse = tool.sampleTextInput ?? "";
      setTextValue(textToUse);
    }

    setWorkspaceState("processing");

    try {
      const processed = await runRealToolProcessor({
        slug: tool.slug,
        files: filesToUse,
        textValue: textToUse,
        settings: settingsValues,
        calculatorInputs: calcInputs,
        unitInputs,
      });

      setRealResult((prev) => {
        revokePreviewUrls(prev);
        return processed;
      });
      setWorkspaceState("success");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Something went wrong while processing your input.";
      setErrorMessage(msg);
      setWorkspaceState("error");
    }
  };

  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownloadClick = () => {
    const activeResult = realResult;
    if (activeResult?.downloadBlob) {
      triggerBlobDownload(activeResult.downloadBlob, activeResult.outputFileName);
      setActionFeedback(`Downloaded ${activeResult.outputFileName}`);
    } else {
      setActionFeedback(
        "UI preview template — connect an encoder backend or WASM worker to download this format."
      );
    }
  };

  const handleCopyOutput = () => {
    const text =
      realResult?.fullTextOutput ??
      (realResult?.previewLines ?? tool.sampleResult.previewLines).join("\n");
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 1800);
  };

  const handleReset = () => {
    setWorkspaceState("empty");
    setSelectedFiles([]);
    setTextValue("");
    setErrorMessage(null);
    setActionFeedback(null);
    setRealResult((prev) => {
      revokePreviewUrls(prev);
      return null;
    });
  };

  const displayedResult = realResult ?? tool.sampleResult;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      {/* Breadcrumb Navigation + Template Switcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs text-[#777777]"
        >
          <button
            type="button"
            onClick={() => onNavigate({ view: "home" })}
            className="hover:text-[#202020] transition-colors cursor-pointer"
          >
            Home
          </button>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <button
            type="button"
            onClick={() =>
              onNavigate({ view: "all-tools", category: tool.categorySlug })
            }
            className="hover:text-[#202020] transition-colors cursor-pointer"
          >
            {tool.categoryName}
          </button>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="font-medium text-[#202020]">{tool.name}</span>
        </nav>

        {/* Preview any tool in this reusable template */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#777777] whitespace-nowrap">
            Switch tool:
          </span>
          <Select
            value={tool.slug}
            onValueChange={(nextSlug) =>
              onNavigate({ view: "tool", slug: nextSlug })
            }
          >
            <SelectTrigger
              aria-label="Switch tool"
              className="h-8 w-[205px] text-xs"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TOOLS_CATALOG.map((item) => (
                <SelectItem key={item.slug} value={item.slug}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tool Name & Concise Description */}
      <header className="mt-7 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#FADAC2] bg-[#FEF2E9] text-[#F28B45]">
          <ToolIcon name={tool.icon} className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-[#202020] sm:text-4xl [text-wrap:balance]">
          {tool.name}
        </h1>
        <p className="mx-auto mt-2.5 max-w-2xl text-base leading-relaxed text-[#777777]">
          {tool.longDescription}
        </p>
        <p className="mt-2 text-xs text-[#777777]">
          {tool.isLive
            ? "Runs locally in your browser · No file uploads required"
            : "UI template preview · Server or WASM encoder required for live export"}
        </p>
      </header>

      {/* Main Centered Workspace Container */}
      <section aria-label="Tool workspace" className="mt-8">
        {/* UI State Preview Switcher */}
        <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <span className="text-xs font-medium text-[#777777]">
            Workspace state
          </span>
          <Tabs
            value={workspaceState}
            onValueChange={(val) => {
              setActionFeedback(null);
              setWorkspaceState(val as WorkspaceState);
            }}
          >
            <TabsList className="h-9">
              <TabsTrigger value="empty" className="text-xs px-3 py-1">
                Input Ready
              </TabsTrigger>
              <TabsTrigger value="processing" className="text-xs px-3 py-1">
                Processing
              </TabsTrigger>
              <TabsTrigger value="success" className="text-xs px-3 py-1">
                Result Ready
              </TabsTrigger>
              <TabsTrigger value="error" className="text-xs px-3 py-1">
                Error State
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="rounded-2xl border border-[#EEE8E2] bg-white p-5 shadow-[0_4px_24px_rgba(32,32,32,0.03)] sm:p-8">
          {/* STATE 1: EMPTY / INPUT READY */}
          {workspaceState === "empty" && (
            <div className="space-y-6">
              {(tool.inputType === "file" || tool.inputType === "multi-file") && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={tool.acceptAttr}
                    multiple={tool.inputType === "multi-file"}
                    className="sr-only"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    aria-label={`Upload file for ${tool.name}`}
                  />

                  {selectedFiles.length === 0 ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        handleFileSelect(e.dataTransfer.files);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          fileInputRef.current?.click();
                        }
                      }}
                      className={cn(
                        "flex min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28B45]",
                        isDragging
                          ? "border-[#F28B45] bg-[#FEF2E9]"
                          : "border-[#E4DBD2] bg-[#FFFAF6] hover:border-[#F28B45]/70 hover:bg-[#FEF8F3]"
                      )}
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#FADAC2] bg-[#FEF2E9] text-[#F28B45]">
                        <UploadCloud className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <p className="mt-4 font-display text-base font-semibold text-[#202020]">
                        {tool.dropzoneHeadline}
                      </p>
                      <p className="mt-1 text-sm text-[#777777]">
                        {tool.dropzoneSubtext}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                        >
                          Choose {tool.inputType === "multi-file" ? "files" : "file"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleLoadSample();
                          }}
                          className="text-[#C8601C] hover:bg-[#FEF2E9]"
                        >
                          Use sample {tool.inputType === "multi-file" ? "PDFs" : "file"}
                        </Button>
                      </div>

                      <p className="mt-4 text-xs text-[#777777]">
                        {tool.acceptedFormatsLabel} · {tool.maxSizeLabel}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {selectedFiles.map((file, idx) => (
                        <div
                          key={`${file.name}-${idx}`}
                          className="flex flex-col items-start justify-between gap-3 rounded-xl border border-[#FADAC2] bg-[#FEF2E9]/55 p-4 sm:flex-row sm:items-center"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F28B45] text-white">
                              <FileCheck2 className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-display text-sm font-semibold text-[#202020]">
                                {file.name}
                              </p>
                              <p className="mt-0.5 text-xs text-[#777777] tabular-nums">
                                {formatBytes(file.size)} · Ready
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {tool.inputType === "file" && (
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                Replace
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setSelectedFiles((prev) =>
                                  prev.filter((_, i) => i !== idx)
                                )
                              }
                              aria-label={`Remove ${file.name}`}
                              className="text-[#777777] hover:text-[#C93B3B]"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {tool.inputType === "multi-file" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-2"
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                          Add another PDF
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {tool.inputType === "text" && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="tool-text-input"
                      className="text-sm font-medium text-[#202020]"
                    >
                      {tool.dropzoneHeadline}
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => void handleLoadSample()}
                        className="text-xs font-medium text-[#C8601C] hover:underline cursor-pointer"
                      >
                        Load sample
                      </button>
                      {textValue && (
                        <button
                          type="button"
                          onClick={() => setTextValue("")}
                          className="text-xs text-[#777777] hover:text-[#202020] cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  <textarea
                    id="tool-text-input"
                    rows={7}
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    placeholder={tool.dropzoneSubtext}
                    className="w-full rounded-xl border border-[#EEE8E2] bg-[#FFFAF6] p-4 font-mono text-sm text-[#202020] placeholder:font-sans placeholder:text-[#777777] focus:border-[#F28B45] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F28B45]/20"
                  />
                  <div className="mt-2 flex items-center justify-between text-xs text-[#777777] tabular-nums">
                    <span>{tool.acceptedFormatsLabel}</span>
                    <span>{textValue.length} characters</span>
                  </div>
                </div>
              )}

              {tool.inputType === "calculator" && (
                <div className="rounded-xl border border-[#EEE8E2] bg-[#FFFAF6] p-5">
                  <p className="font-display text-sm font-semibold text-[#202020]">
                    {tool.dropzoneHeadline}
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="calc-initial"
                        className="block text-xs font-medium text-[#777777]"
                      >
                        Initial deposit ($)
                      </label>
                      <Input
                        id="calc-initial"
                        type="number"
                        min={0}
                        step={100}
                        value={calcInputs.initial}
                        onChange={(e) =>
                          setCalcInputs((p) => ({
                            ...p,
                            initial: Number(e.target.value),
                          }))
                        }
                        className="tabular-nums"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="calc-monthly"
                        className="block text-xs font-medium text-[#777777]"
                      >
                        Monthly contribution ($)
                      </label>
                      <Input
                        id="calc-monthly"
                        type="number"
                        min={0}
                        step={50}
                        value={calcInputs.monthly}
                        onChange={(e) =>
                          setCalcInputs((p) => ({
                            ...p,
                            monthly: Number(e.target.value),
                          }))
                        }
                        className="tabular-nums"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="calc-rate"
                        className="block text-xs font-medium text-[#777777]"
                      >
                        Expected annual return (%)
                      </label>
                      <Input
                        id="calc-rate"
                        type="number"
                        min={0}
                        max={40}
                        step={0.1}
                        value={calcInputs.annualRate}
                        onChange={(e) =>
                          setCalcInputs((p) => ({
                            ...p,
                            annualRate: Number(e.target.value),
                          }))
                        }
                        className="tabular-nums"
                      />
                    </div>
                  </div>
                </div>
              )}

              {tool.inputType === "unit-converter" && (() => {
                const group = UNIT_GROUPS[unitInputs.category];
                const precision = Number(settingsValues.precision ?? 4);
                const liveConverted = convertUnitValue(
                  unitInputs.category,
                  Number(unitInputs.value) || 0,
                  unitInputs.fromUnit,
                  unitInputs.toUnit
                );
                const fromDef =
                  group.units.find((u) => u.id === unitInputs.fromUnit) ?? group.units[0];
                const toDef =
                  group.units.find((u) => u.id === unitInputs.toUnit) ?? group.units[1] ?? group.units[0];
                const formattedOut = Number(liveConverted.toFixed(precision)).toLocaleString(
                  "en-US",
                  { maximumFractionDigits: precision }
                );

                return (
                  <div className="space-y-4 rounded-xl border border-[#EEE8E2] bg-[#FFFAF6] p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      {(Object.keys(UNIT_GROUPS) as UnitCategory[]).map((catKey) => (
                        <button
                          key={catKey}
                          type="button"
                          onClick={() => {
                            const nextUnits = UNIT_GROUPS[catKey].units;
                            setUnitInputs((p) => ({
                              ...p,
                              category: catKey,
                              fromUnit: nextUnits[0].id,
                              toUnit: nextUnits[1]?.id ?? nextUnits[0].id,
                            }));
                          }}
                          className={cn(
                            "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                            unitInputs.category === catKey
                              ? "bg-[#F28B45] text-white"
                              : "border border-[#EEE8E2] bg-white text-[#777777] hover:text-[#202020]"
                          )}
                        >
                          {UNIT_GROUPS[catKey].label}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-12">
                      <div className="space-y-1.5 sm:col-span-3">
                        <label
                          htmlFor="unit-value-input"
                          className="block text-xs font-medium text-[#777777]"
                        >
                          Value
                        </label>
                        <Input
                          id="unit-value-input"
                          type="number"
                          step="any"
                          value={unitInputs.value}
                          onChange={(e) =>
                            setUnitInputs((p) => ({
                              ...p,
                              value: Number(e.target.value),
                            }))
                          }
                          className="tabular-nums"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-4">
                        <label className="block text-xs font-medium text-[#777777]">
                          From
                        </label>
                        <Select
                          value={unitInputs.fromUnit}
                          onValueChange={(val) =>
                            setUnitInputs((p) => ({ ...p, fromUnit: val }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {group.units.map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.label} ({u.symbol})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-center sm:col-span-1">
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          aria-label="Swap units"
                          onClick={() =>
                            setUnitInputs((p) => ({
                              ...p,
                              fromUnit: p.toUnit,
                              toUnit: p.fromUnit,
                            }))
                          }
                          className="h-10 w-10"
                        >
                          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>

                      <div className="space-y-1.5 sm:col-span-4">
                        <label className="block text-xs font-medium text-[#777777]">
                          To
                        </label>
                        <Select
                          value={unitInputs.toUnit}
                          onValueChange={(val) =>
                            setUnitInputs((p) => ({ ...p, toUnit: val }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {group.units.map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.label} ({u.symbol})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-[#FADAC2] bg-[#FEF2E9] px-4 py-3">
                      <span className="text-xs font-medium text-[#777777]">
                        Instant result
                      </span>
                      <p className="font-display text-lg font-semibold text-[#202020] tabular-nums">
                        {unitInputs.value || 0} {fromDef.symbol} ={" "}
                        <span className="text-[#C8601C]">
                          {formattedOut} {toDef.symbol}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Relevant Tool Settings Panel */}
              <div className="border-t border-[#EEE8E2] pt-6">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal
                    className="h-4 w-4 text-[#F28B45]"
                    aria-hidden="true"
                  />
                  <h2 className="font-display text-sm font-semibold text-[#202020]">
                    Tool settings
                  </h2>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {tool.settings.map((setting) => {
                    const currentValue =
                      settingsValues[setting.id] ?? setting.defaultValue;

                    if (setting.type === "select") {
                      return (
                        <div key={setting.id} className="space-y-2">
                          <label className="block text-sm font-medium text-[#202020]">
                            {setting.label}
                          </label>
                          <Select
                            value={String(currentValue)}
                            onValueChange={(val) =>
                              handleSettingChange(setting.id, val)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {setting.options.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {setting.description && (
                            <p className="text-xs text-[#777777]">
                              {setting.description}
                            </p>
                          )}
                        </div>
                      );
                    }

                    if (setting.type === "slider") {
                      return (
                        <div key={setting.id} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-[#202020]">
                              {setting.label}
                            </label>
                            <span className="font-mono text-xs font-semibold text-[#C8601C] tabular-nums">
                              {currentValue} {setting.unit}
                            </span>
                          </div>
                          <Slider
                            value={[Number(currentValue)]}
                            min={setting.min}
                            max={setting.max}
                            step={setting.step}
                            onValueChange={([val]) =>
                              handleSettingChange(setting.id, val)
                            }
                            aria-label={setting.label}
                          />
                          {setting.description && (
                            <p className="text-xs text-[#777777]">
                              {setting.description}
                            </p>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={setting.id}
                        className="flex items-start justify-between gap-4 rounded-xl border border-[#EEE8E2] bg-[#FFFAF6] p-4 sm:col-span-2"
                      >
                        <div>
                          <label
                            htmlFor={`setting-${setting.id}`}
                            className="block text-sm font-medium text-[#202020] cursor-pointer"
                          >
                            {setting.label}
                          </label>
                          {setting.description && (
                            <p className="mt-0.5 text-xs text-[#777777]">
                              {setting.description}
                            </p>
                          )}
                        </div>
                        <Switch
                          id={`setting-${setting.id}`}
                          checked={Boolean(currentValue)}
                          onCheckedChange={(checked) =>
                            handleSettingChange(setting.id, checked)
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Prominent Orange Action Button */}
              <div className="flex flex-col gap-3 border-t border-[#EEE8E2] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-[#777777]">
                  {tool.isLive
                    ? "Processed locally in your browser · Nothing uploaded"
                    : "UI template preview · Select Result Ready above to inspect output"}
                </p>
                <Button
                  type="button"
                  size="lg"
                  onClick={() => void handlePrimaryAction()}
                  className="w-full sm:w-auto sm:min-w-[200px]"
                >
                  {tool.actionLabel}
                </Button>
              </div>
            </div>
          )}

          {/* STATE 2: PROCESSING STATE */}
          {workspaceState === "processing" && (
            <div className="flex min-h-[320px] flex-col items-center justify-center py-8 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FADAC2] bg-[#FEF2E9] text-[#F28B45]">
                <Loader2 className="h-7 w-7 animate-spin" aria-hidden="true" />
              </span>

              <h2 className="mt-5 font-display text-xl font-semibold text-[#202020]">
                {tool.isLive ? `Running ${tool.name}` : `Preparing ${tool.name} preview`}
              </h2>
              <p className="mt-1.5 max-w-md text-sm text-[#777777]">
                Applying your selected settings to{" "}
                <span className="font-medium text-[#202020]">
                  {selectedFiles[0]?.name ?? tool.sampleFileName}
                </span>
                .
              </p>

              <div className="mt-6 w-full max-w-sm">
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#EEE8E2]">
                  <div className="h-full w-2/3 rounded-full bg-[#F28B45] transition-all duration-300" />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-[#777777] tabular-nums">
                  <span>Processing locally</span>
                  <span>68%</span>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                {!tool.isLive && (
                  <Button
                    type="button"
                    onClick={() => setWorkspaceState("success")}
                  >
                    Preview Result State
                  </Button>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setWorkspaceState("empty")}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* STATE 3: RESULT PREVIEW AREA + DOWNLOAD BUTTON */}
          {workspaceState === "success" && (
            <div className="space-y-6">
              <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-5 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3.5">
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-[#15803D]"
                    aria-hidden="true"
                  />
                  <div>
                    <h2 className="font-display text-base font-semibold text-[#202020]">
                      Output ready — {displayedResult.outputFileName}
                    </h2>
                    <p className="mt-0.5 text-sm text-[#4B5563]">
                      {displayedResult.summaryNote}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-xs font-semibold text-[#15803D] tabular-nums">
                  {displayedResult.deltaLabel}
                </span>
              </div>

              {/* Result Comparison Metrics */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[#EEE8E2] bg-[#FFFAF6] p-4">
                  <p className="text-xs font-medium text-[#777777]">
                    Original input
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold text-[#202020] tabular-nums">
                    {displayedResult.originalMetric}
                  </p>
                </div>
                <div className="rounded-xl border border-[#FADAC2] bg-[#FEF2E9]/50 p-4">
                  <p className="text-xs font-medium text-[#C8601C]">
                    Processed output
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold text-[#202020] tabular-nums">
                    {displayedResult.outputMetric}
                  </p>
                </div>
              </div>

              {/* Visual Image Preview (Resize Image / WebP / SVG) */}
              {realResult?.previewImageUrl && (
                <div className="rounded-xl border border-[#EEE8E2] bg-[#FFFAF6] p-4">
                  <p className="mb-3 text-xs font-medium text-[#777777]">
                    Live output preview
                  </p>
                  <div className="flex max-h-[300px] items-center justify-center overflow-hidden rounded-lg border border-[#EEE8E2] bg-white p-3">
                    <img
                      src={realResult.previewImageUrl}
                      alt={realResult.outputFileName}
                      className="max-h-[260px] w-auto object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Audio Playback Preview (Trim Audio) */}
              {realResult?.previewAudioUrl && (
                <div className="rounded-xl border border-[#EEE8E2] bg-[#FFFAF6] p-4">
                  <p className="mb-2.5 text-xs font-medium text-[#777777]">
                    Listen to trimmed audio
                  </p>
                  <audio
                    controls
                    src={realResult.previewAudioUrl}
                    className="w-full"
                  />
                </div>
              )}

              {/* Individual ZIP Entries Extraction List */}
              {realResult?.extractedEntries &&
                realResult.extractedEntries.length > 0 && (
                  <div className="rounded-xl border border-[#EEE8E2] bg-[#FFFAF6] p-4">
                    <p className="mb-3 text-xs font-medium text-[#777777]">
                      Archive files ({realResult.extractedEntries.length})
                    </p>
                    <div className="divide-y divide-[#EEE8E2] rounded-lg border border-[#EEE8E2] bg-white">
                      {realResult.extractedEntries.map((entry) => (
                        <div
                          key={entry.name}
                          className="flex items-center justify-between gap-3 px-4 py-2.5"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-mono text-xs font-medium text-[#202020]">
                              {entry.name}
                            </p>
                            <p className="text-[11px] text-[#777777] tabular-nums">
                              {entry.sizeFormatted}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={async () => {
                              const blob = await entry.getBlob();
                              const shortName =
                                entry.name.split("/").pop() || entry.name;
                              triggerBlobDownload(blob, shortName);
                            }}
                          >
                            <Download className="h-3.5 w-3.5" aria-hidden="true" />
                            Extract
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Result Text / Summary Preview Area */}
              <div className="rounded-xl border border-[#EEE8E2] bg-[#FFFAF6] p-5">
                <div className="flex items-center justify-between border-b border-[#EEE8E2] pb-3">
                  <span className="text-xs font-medium text-[#777777]">
                    Output details
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyOutput}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#202020] hover:text-[#C8601C] cursor-pointer"
                  >
                    {copiedSummary ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#15803D]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>
                          {realResult?.fullTextOutput ? "Copy output" : "Copy summary"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="mt-3 max-h-60 overflow-auto font-mono text-xs leading-relaxed text-[#202020]">
                  {displayedResult.previewLines.join("\n")}
                </pre>
              </div>

              {actionFeedback && (
                <p
                  role="status"
                  className="rounded-lg border border-[#FADAC2] bg-[#FEF2E9] px-4 py-2.5 text-xs font-medium text-[#C8601C]"
                >
                  {actionFeedback}
                </p>
              )}

              {/* Download & Reset Actions */}
              <div className="flex flex-col gap-3 border-t border-[#EEE8E2] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Start over
                </Button>
                <Button
                  type="button"
                  size="lg"
                  onClick={handleDownloadClick}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  {displayedResult.downloadLabel}
                </Button>
              </div>
            </div>
          )}

          {/* STATE 4: ERROR STATE */}
          {workspaceState === "error" && (
            <div className="flex min-h-[300px] flex-col items-center justify-center py-6 text-center">
              <div className="w-full max-w-md rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-6">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#C93B3B] border border-[#FECACA]">
                  <AlertCircle className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-display text-lg font-semibold text-[#202020]">
                  Unable to process this input
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-[#777777]">
                  {errorMessage ??
                    `The selected file appears to be damaged, password-locked, or in an unsupported format. Please verify it matches ${tool.acceptedFormatsLabel} (${tool.maxSizeLabel}).`}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button type="button" onClick={() => setWorkspaceState("empty")}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Edit input & retry
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleReset}
                >
                  Reset workspace
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How-To-Use Section */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold tracking-tight text-[#202020]">
          How to use {tool.name}
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {tool.howToSteps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-xl border border-[#EEE8E2] bg-white p-5"
            >
              <span className="font-mono text-xs font-semibold text-[#F28B45] tabular-nums">
                Step 0{index + 1}
              </span>
              <h3 className="mt-2.5 font-display text-base font-semibold text-[#202020]">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#777777]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="mt-14 border-t border-[#EEE8E2] pt-12">
        <h2 className="font-display text-2xl font-bold tracking-tight text-[#202020]">
          Frequently asked questions
        </h2>
        <Accordion type="single" collapsible className="mt-4">
          {tool.faqs.map((faq, idx) => (
            <AccordionItem key={faq.question} value={`faq-${idx}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
};
