import { PDFDocument, PageSizes, StandardFonts } from "pdf-lib";
import JSZip from "jszip";
import { GIFEncoder, applyPalette, quantize } from "gifenc";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Document, HeadingLevel, Packer, PageBreak, Paragraph, TextRun } from "docx";
import { Mp3Encoder } from "@breezystack/lamejs";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface ExtractedZipEntry {
  name: string;
  sizeBytes: number;
  sizeFormatted: string;
  getBlob: () => Promise<Blob>;
}

export interface ProcessedToolResult {
  outputFileName: string;
  originalMetric: string;
  outputMetric: string;
  deltaLabel: string;
  summaryNote: string;
  previewLines: string[];
  downloadLabel: string;
  downloadBlob?: Blob;
  previewImageUrl?: string;
  previewAudioUrl?: string;
  extractedEntries?: ExtractedZipEntry[];
  fullTextOutput?: string;
}

export interface CalculatorInputs {
  initial: number;
  monthly: number;
  annualRate: number;
}

export type UnitCategory = "length" | "weight" | "temperature" | "data" | "speed";

export interface UnitConverterInputs {
  category: UnitCategory;
  value: number;
  fromUnit: string;
  toUnit: string;
}

export const UNIT_GROUPS: Record<
  UnitCategory,
  {
    label: string;
    units: { id: string; label: string; symbol: string; factorToBase?: number }[];
  }
> = {
  length: {
    label: "Length",
    units: [
      { id: "m", label: "Meters", symbol: "m", factorToBase: 1 },
      { id: "km", label: "Kilometers", symbol: "km", factorToBase: 1000 },
      { id: "cm", label: "Centimeters", symbol: "cm", factorToBase: 0.01 },
      { id: "mm", label: "Millimeters", symbol: "mm", factorToBase: 0.001 },
      { id: "mi", label: "Miles", symbol: "mi", factorToBase: 1609.344 },
      { id: "yd", label: "Yards", symbol: "yd", factorToBase: 0.9144 },
      { id: "ft", label: "Feet", symbol: "ft", factorToBase: 0.3048 },
      { id: "in", label: "Inches", symbol: "in", factorToBase: 0.0254 },
    ],
  },
  weight: {
    label: "Weight & Mass",
    units: [
      { id: "kg", label: "Kilograms", symbol: "kg", factorToBase: 1 },
      { id: "g", label: "Grams", symbol: "g", factorToBase: 0.001 },
      { id: "mg", label: "Milligrams", symbol: "mg", factorToBase: 0.000001 },
      { id: "lb", label: "Pounds", symbol: "lb", factorToBase: 0.45359237 },
      { id: "oz", label: "Ounces", symbol: "oz", factorToBase: 0.028349523125 },
    ],
  },
  temperature: {
    label: "Temperature",
    units: [
      { id: "c", label: "Celsius", symbol: "°C" },
      { id: "f", label: "Fahrenheit", symbol: "°F" },
      { id: "k", label: "Kelvin", symbol: "K" },
    ],
  },
  data: {
    label: "Digital Storage",
    units: [
      { id: "b", label: "Bytes", symbol: "B", factorToBase: 1 },
      { id: "kb", label: "Kilobytes", symbol: "KB", factorToBase: 1000 },
      { id: "mb", label: "Megabytes", symbol: "MB", factorToBase: 1000 ** 2 },
      { id: "gb", label: "Gigabytes", symbol: "GB", factorToBase: 1000 ** 3 },
      { id: "tb", label: "Terabytes", symbol: "TB", factorToBase: 1000 ** 4 },
    ],
  },
  speed: {
    label: "Speed",
    units: [
      { id: "ms", label: "Meters / sec", symbol: "m/s", factorToBase: 1 },
      { id: "kmh", label: "Kilometers / hr", symbol: "km/h", factorToBase: 1 / 3.6 },
      { id: "mph", label: "Miles / hr", symbol: "mph", factorToBase: 0.44704 },
      { id: "kn", label: "Knots", symbol: "kn", factorToBase: 0.514444 },
    ],
  },
};

export function convertUnitValue(
  category: UnitCategory,
  value: number,
  fromUnit: string,
  toUnit: string
): number {
  if (category === "temperature") {
    let celsius = value;
    if (fromUnit === "f") celsius = (value - 32) * (5 / 9);
    else if (fromUnit === "k") celsius = value - 273.15;

    if (toUnit === "f") return celsius * (9 / 5) + 32;
    if (toUnit === "k") return celsius + 273.15;
    return celsius;
  }

  const units = UNIT_GROUPS[category].units;
  const fromDef = units.find((u) => u.id === fromUnit) ?? units[0];
  const toDef = units.find((u) => u.id === toUnit) ?? units[0];
  const baseVal = value * (fromDef.factorToBase ?? 1);
  return baseVal / (toDef.factorToBase ?? 1);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

export function calcDeltaPercent(before: number, after: number): string {
  if (before <= 0) return "Ready";
  const diff = ((before - after) / before) * 100;
  if (diff > 0.5) return `${Math.round(diff)}% smaller`;
  if (diff < -0.5) return `${Math.abs(Math.round(diff))}% larger`;
  return "Same size";
}

// ---------- Sample Generators (Real In-Memory Files!) ----------

export async function createSampleFileForTool(slug: string): Promise<File[]> {
  if (slug === "resize-image" || slug === "convert-webp") {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 675;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#FFFAF6";
      ctx.fillRect(0, 0, 1200, 675);
      ctx.fillStyle = "#FEF2E9";
      ctx.fillRect(64, 64, 1072, 547);
      ctx.strokeStyle = "#F28B45";
      ctx.lineWidth = 4;
      ctx.strokeRect(64, 64, 1072, 547);
      ctx.fillStyle = "#F28B45";
      ctx.beginPath();
      ctx.arc(240, 260, 72, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#202020";
      ctx.fillRect(360, 195, 560, 34);
      ctx.fillStyle = "#777777";
      ctx.fillRect(360, 255, 420, 20);
      ctx.fillRect(360, 292, 340, 20);
      ctx.fillStyle = "#202020";
      ctx.font = "600 30px sans-serif";
      ctx.fillText("Forma Studio Sample Banner (1200 x 675)", 360, 420);
    }
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b ?? new Blob()), "image/png")
    );
    const name =
      slug === "convert-webp"
        ? "product-shot-01.png"
        : "editorial-studio-banner.png";
    return [new File([blob], name, { type: "image/png" })];
  }

  if (slug === "compress-pdf") {
    const doc = await PDFDocument.create();
    doc.setTitle("Q4 Product Roadmap Deck");
    doc.setAuthor("Forma Sample Author");
    doc.setSubject("Quarterly Planning Sample");
    doc.setKeywords(["roadmap", "sample", "forma"]);
    for (let i = 1; i <= 3; i++) {
      const page = doc.addPage([612, 792]);
      page.drawText(`Forma Sample PDF — Page ${i} of 3`, { x: 56, y: 720, size: 18 });
      page.drawText(
        "This sample PDF was generated directly in your browser for testing.",
        { x: 56, y: 685, size: 12 }
      );
    }
    const bytes = await doc.save({ useObjectStreams: false });
    return [
      new File([new Uint8Array(bytes)], "Q4-Product-Roadmap-Deck.pdf", {
        type: "application/pdf",
      }),
    ];
  }

  if (slug === "pdf-to-word") {
    const doc = await PDFDocument.create();
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const fontReg = await doc.embedFont(StandardFonts.Helvetica);

    const p1 = doc.addPage([612, 792]);
    p1.drawText("Annual Partner Brief — 2026", { x: 56, y: 720, size: 20, font: fontBold });
    p1.drawText("Executive Summary", { x: 56, y: 680, size: 14, font: fontBold });
    p1.drawText(
      "This brief outlines our upcoming product milestones, shared infrastructure updates,",
      { x: 56, y: 655, size: 11, font: fontReg }
    );
    p1.drawText(
      "and regional support priorities across North America and Europe.",
      { x: 56, y: 638, size: 11, font: fontReg }
    );

    const p2 = doc.addPage([612, 792]);
    p2.drawText("Key Quarterly Deliverables", { x: 56, y: 720, size: 16, font: fontBold });
    p2.drawText(
      "1. Launch browser-native document and media converters with zero account friction.",
      { x: 56, y: 685, size: 11, font: fontReg }
    );
    p2.drawText(
      "2. Reduce turnaround time for everyday file preparation across teams.",
      { x: 56, y: 665, size: 11, font: fontReg }
    );

    const bytes = await doc.save();
    return [
      new File([new Uint8Array(bytes)], "Annual-Partner-Brief.pdf", {
        type: "application/pdf",
      }),
    ];
  }

  if (slug === "merge-pdf") {
    const makeDoc = async (title: string, pages: number, filename: string) => {
      const doc = await PDFDocument.create();
      for (let i = 1; i <= pages; i++) {
        const page = doc.addPage([612, 792]);
        page.drawText(`${title} — Page ${i}`, { x: 56, y: 720, size: 18 });
      }
      const bytes = await doc.save();
      return new File([new Uint8Array(bytes)], filename, {
        type: "application/pdf",
      });
    };
    return Promise.all([
      makeDoc("Service Agreement", 2, "Agreement-Part-1.pdf"),
      makeDoc("Signature Schedule", 2, "Schedule-B.pdf"),
    ]);
  }

  if (slug === "video-to-gif") {
    // Try recording a real 1.8s WebM animation from a canvas
    const canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 270;
    const ctx = canvas.getContext("2d");

    if (typeof MediaRecorder !== "undefined" && "captureStream" in canvas && ctx) {
      try {
        const stream = canvas.captureStream(24);
        const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
          ? "video/webm;codecs=vp8"
          : "video/webm";
        const recorder = new MediaRecorder(stream, { mimeType });
        const chunks: BlobPart[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        const stopped = new Promise<Blob>((resolve) => {
          recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
        });

        recorder.start();
        const start = performance.now();
        await new Promise<void>((resolve) => {
          const draw = (now: number) => {
            const elapsed = (now - start) / 1000;
            const t = Math.min(1, elapsed / 1.6);
            ctx.fillStyle = "#FFFAF6";
            ctx.fillRect(0, 0, 480, 270);
            ctx.fillStyle = "#FFFFFF";
            ctx.strokeStyle = "#EEE8E2";
            ctx.lineWidth = 2;
            ctx.fillRect(36, 36, 408, 198);
            ctx.strokeRect(36, 36, 408, 198);

            const cx = 100 + t * 280;
            ctx.fillStyle = "#F28B45";
            ctx.beginPath();
            ctx.arc(cx, 135, 30, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#202020";
            ctx.font = "600 18px sans-serif";
            ctx.fillText(`Forma Motion Demo · ${Math.round(t * 100)}%`, 110, 206);

            if (elapsed < 1.6) {
              requestAnimationFrame(draw);
            } else {
              recorder.stop();
              resolve();
            }
          };
          requestAnimationFrame(draw);
        });

        const webmBlob = await stopped;
        if (webmBlob.size > 0) {
          return [
            new File([webmBlob], "forma-motion-demo.webm", {
              type: "video/webm",
            }),
          ];
        }
      } catch {
        // Fall through to sentinel sample video trigger
      }
    }

    // Fallback synthetic video marker handled gracefully in video-to-gif processor
    return [
      new File(["forma-synthetic-sample"], "forma-motion-demo.webm", {
        type: "video/x-forma-sample",
      }),
    ];
  }

  if (slug === "svg-optimizer") {
    const rawSvg = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generator: Sample Vector Editor 2.4 -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="128" height="128" viewBox="0 0 128 128" fill="none">
  <metadata>
    <rdf:RDF>Sample editor bloat metadata to strip during optimization</rdf:RDF>
  </metadata>
  <title>Forma Mark</title>
  <desc>Sample geometric vector icon</desc>
  <rect x="12.0000" y="12.0000" width="104.0000" height="104.0000" rx="20.0000" fill="#FEF2E9" stroke="#FADAC2" stroke-width="4.0000" />
  <path d="M32.0000 32.0000 H60.0000 V60.0000 H32.0000 Z" fill="#F28B45" />
  <path d="M68.0000 32.0000 H96.0000 V60.0000 H68.0000 Z" fill="#202020" />
  <path d="M32.0000 68.0000 H60.0000 V96.0000 H32.0000 Z" fill="#202020" />
  <circle cx="82.0000" cy="82.0000" r="14.0000" fill="#F28B45" />
</svg>`;
    return [
      new File([rawSvg], "brand-mark-export.svg", { type: "image/svg+xml" }),
    ];
  }

  if (slug === "archive-extractor") {
    const zip = new JSZip();
    zip.file("README.txt", "Forma Design Handoff Bundle\nIncludes brand tokens and copy.");
    zip.file(
      "tokens/colors.json",
      JSON.stringify({ primary: "#F28B45", bg: "#FFFAF6" }, null, 2)
    );
    zip.file("notes/changelog.md", "# Release 1.0\n- Clean workspace layout\n");
    zip.file(".DS_Store", "macOS metadata artifact");
    const blob = await zip.generateAsync({ type: "blob" });
    return [
      new File([blob], "design-handoff-assets.zip", { type: "application/zip" }),
    ];
  }

  if (slug === "trim-audio" || slug === "audio-converter") {
    const sampleRate = 44100;
    const durationSec = 2.5;
    const numSamples = Math.floor(sampleRate * durationSec);
    const actx = new AudioContext();
    const buffer = actx.createBuffer(2, numSamples, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    const freqs = [261.63, 329.63, 392.0, 493.88];
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const env = Math.min(1, t / 0.08) * Math.min(1, (durationSec - t) / 0.2);
      let sum = 0;
      for (const f of freqs) sum += Math.sin(2 * Math.PI * f * t);
      const val = (sum / freqs.length) * 0.35 * env;
      left[i] = val;
      right[i] = val;
    }
    await actx.close();
    const wavBlob = encodeAudioBufferToWav(buffer);
    return [new File([wavBlob], "studio-warm-chord.wav", { type: "audio/wav" })];
  }

  return [];
}

// ---------- Helpers ----------

function sortObjectKeysDeep(val: unknown): unknown {
  if (Array.isArray(val)) return val.map(sortObjectKeysDeep);
  if (val && typeof val === "object") {
    const sorted: Record<string, unknown> = {};
    Object.keys(val as Record<string, unknown>)
      .sort((a, b) => a.localeCompare(b))
      .forEach((key) => {
        sorted[key] = sortObjectKeysDeep((val as Record<string, unknown>)[key]);
      });
    return sorted;
  }
  return val;
}

function parseCsvRows(input: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const next = input[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(field.trim());
      field = "";
    } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
      if (ch === "\r") i++;
      row.push(field.trim());
      if (row.some((c) => c.length > 0)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field.trim());
    if (row.some((c) => c.length > 0)) rows.push(row);
  }
  return rows;
}

function escapeCsvCell(val: unknown, delimiter: string): string {
  const str = val === null || val === undefined ? "" : String(val);
  if (
    str.includes(delimiter) ||
    str.includes('"') ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ---------- Main Processor Dispatch ----------

export async function runRealToolProcessor(params: {
  slug: string;
  files: File[];
  textValue: string;
  settings: Record<string, string | number | boolean>;
  calculatorInputs: CalculatorInputs;
  unitInputs: UnitConverterInputs;
}): Promise<ProcessedToolResult> {
  const { slug, files, textValue, settings, calculatorInputs, unitInputs } =
    params;

  switch (slug) {
    case "format-json": {
      if (!textValue.trim()) {
        throw new Error("Please paste JSON text or load the sample payload first.");
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(textValue);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Invalid JSON syntax";
        throw new Error(`JSON Parse Error: ${msg}`);
      }
      const processed = settings.sortKeys ? sortObjectKeysDeep(parsed) : parsed;
      const style = String(settings.indentation ?? "2spaces");
      let formatted = "";
      if (style === "minify") formatted = JSON.stringify(processed);
      else if (style === "4spaces") formatted = JSON.stringify(processed, null, 4);
      else if (style === "tab") formatted = JSON.stringify(processed, null, "\t");
      else formatted = JSON.stringify(processed, null, 2);

      const lines = formatted.split("\n");
      const blob = new Blob([formatted], { type: "application/json" });
      return {
        outputFileName: "formatted-payload.json",
        originalMetric: `${textValue.length} chars`,
        outputMetric: `${lines.length} ${lines.length === 1 ? "line" : "lines"} · ${formatBytes(blob.size)}`,
        deltaLabel: "Valid JSON",
        summaryNote: `Parsed cleanly with 0 syntax errors (${style === "minify" ? "minified" : style}).`,
        previewLines: lines.slice(0, 14),
        fullTextOutput: formatted,
        downloadLabel: "Download JSON File",
        downloadBlob: blob,
      };
    }

    case "csv-json-converter": {
      const trimmed = textValue.trim();
      if (!trimmed) {
        throw new Error("Please paste CSV rows or a JSON array to convert.");
      }
      const dirSetting = String(settings.direction ?? "auto");
      const delimiter = String(settings.delimiter ?? ",");
      const pretty = Boolean(settings.prettyJson ?? true);

      const looksLikeJson =
        dirSetting === "json-to-csv" ||
        (dirSetting === "auto" &&
          (trimmed.startsWith("[") || trimmed.startsWith("{")));

      if (looksLikeJson) {
        let parsed: unknown;
        try {
          parsed = JSON.parse(trimmed);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Invalid JSON";
          throw new Error(`JSON Parse Error: ${msg}`);
        }
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        if (arr.length === 0 || typeof arr[0] !== "object" || arr[0] === null) {
          throw new Error("JSON input must be a non-empty object or array of objects.");
        }
        const headers = Array.from(
          new Set(
            arr.flatMap((item) =>
              item && typeof item === "object" ? Object.keys(item as object) : []
            )
          )
        );
        const csvLines = [
          headers.map((h) => escapeCsvCell(h, delimiter)).join(delimiter),
          ...arr.map((row) =>
            headers
              .map((h) =>
                escapeCsvCell((row as Record<string, unknown>)[h], delimiter)
              )
              .join(delimiter)
          ),
        ];
        const csvOutput = csvLines.join("\n");
        const blob = new Blob([csvOutput], { type: "text/csv" });
        return {
          outputFileName: "converted-table.csv",
          originalMetric: `${arr.length} JSON ${arr.length === 1 ? "object" : "objects"}`,
          outputMetric: `${csvLines.length} CSV lines (${formatBytes(blob.size)})`,
          deltaLabel: "JSON → CSV",
          summaryNote: `Exported ${headers.length} columns with ${arr.length} data rows.`,
          previewLines: csvLines.slice(0, 14),
          fullTextOutput: csvOutput,
          downloadLabel: "Download CSV File",
          downloadBlob: blob,
        };
      } else {
        const rows = parseCsvRows(trimmed, delimiter);
        if (rows.length < 2) {
          throw new Error("CSV needs at least a header row and one data row.");
        }
        const headers = rows[0];
        const objects = rows.slice(1).map((cells) => {
          const obj: Record<string, string | number | boolean> = {};
          headers.forEach((header, idx) => {
            const raw = cells[idx] ?? "";
            if (raw === "true") obj[header] = true;
            else if (raw === "false") obj[header] = false;
            else if (raw !== "" && !Number.isNaN(Number(raw))) obj[header] = Number(raw);
            else obj[header] = raw;
          });
          return obj;
        });

        const jsonOutput = JSON.stringify(objects, null, pretty ? 2 : 0);
        const lines = jsonOutput.split("\n");
        const blob = new Blob([jsonOutput], { type: "application/json" });
        return {
          outputFileName: "converted-data.json",
          originalMetric: `${rows.length - 1} CSV rows`,
          outputMetric: `${objects.length} JSON objects (${formatBytes(blob.size)})`,
          deltaLabel: "CSV → JSON",
          summaryNote: `Parsed ${headers.length} columns (${headers.join(", ")}).`,
          previewLines: lines.slice(0, 14),
          fullTextOutput: jsonOutput,
          downloadLabel: "Download JSON File",
          downloadBlob: blob,
        };
      }
    }

    case "unit-converter": {
      const val = Number(unitInputs.value);
      if (Number.isNaN(val)) {
        throw new Error("Please enter a valid number to convert.");
      }
      const cat = unitInputs.category;
      const group = UNIT_GROUPS[cat];
      const precision = Number(settings.precision ?? 4);
      const fromDef =
        group.units.find((u) => u.id === unitInputs.fromUnit) ?? group.units[0];
      const toDef =
        group.units.find((u) => u.id === unitInputs.toUnit) ?? group.units[1] ?? group.units[0];

      const converted = convertUnitValue(cat, val, fromDef.id, toDef.id);
      const formatNum = (n: number) =>
        Number(n.toFixed(precision)).toLocaleString("en-US", {
          maximumFractionDigits: precision,
        });

      const csvRows = ["Unit,Symbol,Equivalent Value"];
      const previewLines: string[] = [];

      group.units.forEach((u) => {
        const eq = convertUnitValue(cat, val, fromDef.id, u.id);
        const formatted = formatNum(eq);
        csvRows.push(`${u.label},${u.symbol},"${formatted}"`);
        previewLines.push(`${u.label} (${u.symbol}): ${formatted}`);
      });

      const csvText = csvRows.join("\n");
      const blob = new Blob([csvText], { type: "text/csv" });

      return {
        outputFileName: `${cat}-conversions.csv`,
        originalMetric: `${formatNum(val)} ${fromDef.symbol}`,
        outputMetric: `${formatNum(converted)} ${toDef.symbol}`,
        deltaLabel: group.label,
        summaryNote: `${formatNum(val)} ${fromDef.label} equals ${formatNum(converted)} ${toDef.label}.`,
        previewLines,
        fullTextOutput: csvText,
        downloadLabel: "Download Conversion Table",
        downloadBlob: blob,
      };
    }

    case "word-counter": {
      const trimmed = textValue.trim();
      if (!trimmed) {
        throw new Error("Please enter or paste some text to analyze.");
      }
      const words = trimmed.split(/\s+/).filter(Boolean);
      const charsWithSpaces = textValue.length;
      const charsNoSpaces = textValue.replace(/\s+/g, "").length;
      const sentences = trimmed
        .split(/[.!?]+/)
        .map((s) => s.trim())
        .filter(Boolean).length;
      const paragraphs = trimmed
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean).length;

      const wpm = Number(settings.readingSpeed ?? 225);
      const totalSeconds = Math.max(1, Math.round((words.length / wpm) * 60));
      const readLabel =
        totalSeconds < 60
          ? `~${totalSeconds} sec read`
          : `~${Math.floor(totalSeconds / 60)}m ${totalSeconds % 60}s read`;

      const avgLen =
        words.length > 0
          ? (
              words.reduce((acc, w) => acc + w.replace(/[^\w]/g, "").length, 0) /
              words.length
            ).toFixed(1)
          : "0";

      const reportLines = [
        `Words: ${words.length}`,
        `Characters (with spaces): ${charsWithSpaces}`,
        `Characters (no spaces): ${charsNoSpaces}`,
        `Sentences: ${sentences || 1}`,
        `Paragraphs: ${paragraphs || 1}`,
        `Average word length: ${avgLen} characters`,
        `Estimated reading time (${wpm} wpm): ${readLabel}`,
      ];
      const reportText = reportLines.join("\n");
      const blob = new Blob([reportText], { type: "text/plain" });

      return {
        outputFileName: "text-metrics-summary.txt",
        originalMetric: `${words.length} ${words.length === 1 ? "word" : "words"}`,
        outputMetric: settings.excludeSpaces
          ? `${charsNoSpaces} chars (no spaces)`
          : `${charsWithSpaces} chars · ${readLabel}`,
        deltaLabel: `${sentences || 1} ${sentences === 1 ? "sentence" : "sentences"}`,
        summaryNote: `Average word length ${avgLen} chars across ${paragraphs || 1} paragraph(s).`,
        previewLines: reportLines,
        fullTextOutput: reportText,
        downloadLabel: "Download Metrics Report",
        downloadBlob: blob,
      };
    }

    case "resize-image":
    case "convert-webp": {
      const file = files[0];
      if (!file) {
        throw new Error("Please upload an image file or click Use sample file.");
      }
      const isImageByExt = /\.(png|jpe?g|webp|gif|bmp|svg|ico|avif)$/i.test(
        file.name
      );
      if (!file.type.startsWith("image/") && !isImageByExt) {
        throw new Error(
          `Unsupported file type (${file.type || file.name}). Please select a PNG, JPG, WebP, GIF, BMP, SVG, ICO, or AVIF image.`
        );
      }

      const rawFormat =
        slug === "convert-webp"
          ? String(settings.targetFormat ?? "webp")
          : String(settings.outputFormat ?? "image/webp");
      const targetFmt = rawFormat.replace("image/", "").toLowerCase(); // webp | png | jpeg | gif | bmp | ico | tiff | svg | avif
      const quality = Number(settings.quality ?? 88) / 100;
      const bgFill = String(settings.bgFill ?? "#FFFFFF");

      // Special case: SVG -> SVG pass-through
      if (
        slug === "convert-webp" &&
        targetFmt === "svg" &&
        (file.type === "image/svg+xml" || /\.svg$/i.test(file.name))
      ) {
        const svgText = await file.text();
        const outBlob = new Blob([svgText], { type: "image/svg+xml" });
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        return {
          outputFileName: `${baseName}.svg`,
          originalMetric: `SVG (${formatBytes(file.size)})`,
          outputMetric: `SVG (${formatBytes(outBlob.size)})`,
          deltaLabel: "Same format",
          summaryNote: "Preserved original vector SVG markup.",
          previewLines: [svgText.slice(0, 400)],
          fullTextOutput: svgText,
          downloadLabel: "Download SVG Image",
          downloadBlob: outBlob,
          previewImageUrl: URL.createObjectURL(outBlob),
        };
      }

      const objectUrl = URL.createObjectURL(file);
      try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = () =>
            reject(
              new Error(
                "Could not decode the selected image file in this browser."
              )
            );
          el.src = objectUrl;
        });

        let targetW = img.naturalWidth || 512;
        let targetH = img.naturalHeight || 512;

        if (slug === "resize-image") {
          const preset = String(settings.presetSize ?? "1200");
          if (preset === "half") {
            targetW = Math.max(1, Math.round(targetW * 0.5));
          } else {
            targetW = Number(preset) || targetW;
          }
          targetH = Math.max(
            1,
            Math.round((targetW / (img.naturalWidth || 1)) * (img.naturalHeight || 1))
          );
        } else if (targetFmt === "ico") {
          // ICO spec caps icon entries at 256x256
          const maxDim = Math.max(targetW, targetH);
          if (maxDim > 256) {
            const scale = 256 / maxDim;
            targetW = Math.max(1, Math.round(targetW * scale));
            targetH = Math.max(1, Math.round(targetH * scale));
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) throw new Error("Canvas 2D context is unavailable.");

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        if (targetFmt === "jpeg" || targetFmt === "jpg" || targetFmt === "bmp") {
          ctx.fillStyle = bgFill;
          ctx.fillRect(0, 0, targetW, targetH);
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);

        let outBlob: Blob;
        let ext = targetFmt === "jpeg" ? "jpg" : targetFmt;

        if (targetFmt === "png" || targetFmt === "jpeg" || targetFmt === "webp" || targetFmt === "avif") {
          const mime = `image/${targetFmt}`;
          outBlob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (b) =>
                b
                  ? resolve(b)
                  : reject(new Error(`Failed to encode ${ext.toUpperCase()} image.`)),
              mime,
              quality
            );
          });
          if (targetFmt === "avif" && outBlob.type !== "image/avif") {
            throw new Error(
              "Your current browser does not support AVIF encoding via Canvas. Try WebP, PNG, or JPG instead."
            );
          }
        } else if (targetFmt === "gif") {
          const { data } = ctx.getImageData(0, 0, targetW, targetH);
          const palette = quantize(data, 256);
          const index = applyPalette(data, palette);
          const gif = GIFEncoder();
          gif.writeFrame(index, targetW, targetH, { palette });
          gif.finish();
          outBlob = new Blob([new Uint8Array(gif.bytes())], { type: "image/gif" });
        } else if (targetFmt === "bmp") {
          const imgData = ctx.getImageData(0, 0, targetW, targetH);
          outBlob = encodeImageDataToBmp(imgData);
        } else if (targetFmt === "ico") {
          const pngBlob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (b) => (b ? resolve(b) : reject(new Error("Failed to encode ICO payload."))),
              "image/png"
            );
          });
          outBlob = await encodePngToIco(pngBlob, targetW, targetH);
        } else if (targetFmt === "tiff") {
          const imgData = ctx.getImageData(0, 0, targetW, targetH);
          outBlob = encodeImageDataToTiff(imgData);
        } else if (targetFmt === "svg") {
          const pngDataUrl = canvas.toDataURL("image/png");
          const svgWrap = `<svg xmlns="http://www.w3.org/2000/svg" width="${targetW}" height="${targetH}" viewBox="0 0 ${targetW} ${targetH}"><image href="${pngDataUrl}" width="${targetW}" height="${targetH}" /></svg>`;
          outBlob = new Blob([svgWrap], { type: "image/svg+xml" });
        } else {
          throw new Error(`Unsupported output format: ${targetFmt}`);
        }

        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const outName =
          slug === "resize-image"
            ? `${baseName}-${targetW}w.${ext}`
            : `${baseName}.${ext}`;

        // Browsers cannot render TIFF inside <img>, so preview via PNG data url for TIFF
        const previewUrl =
          ext === "tiff"
            ? canvas.toDataURL("image/png")
            : URL.createObjectURL(outBlob);

        return {
          outputFileName: outName,
          originalMetric: `${img.naturalWidth} × ${img.naturalHeight} px (${formatBytes(file.size)})`,
          outputMetric: `${targetW} × ${targetH} px (${formatBytes(outBlob.size)})`,
          deltaLabel: calcDeltaPercent(file.size, outBlob.size),
          summaryNote: `Converted to ${ext.toUpperCase()} (${targetW} × ${targetH} px) directly in your browser.`,
          previewLines: [
            `Dimensions: ${targetW} × ${targetH} px`,
            `Output format: ${ext.toUpperCase()}`,
            `Size: ${formatBytes(file.size)} → ${formatBytes(outBlob.size)}`,
          ],
          downloadLabel: `Download ${ext.toUpperCase()} Image`,
          downloadBlob: outBlob,
          previewImageUrl: previewUrl,
        };
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    }

    case "video-to-gif": {
      const file = files[0];
      if (!file) {
        throw new Error("Please drop a video clip or click Use sample file.");
      }

      const fps = Number(settings.fps ?? 12);
      const targetWidth = Number(settings.width ?? 480);
      const loopForever = Boolean(settings.loopForever ?? true);
      const delayMs = Math.round(1000 / fps);

      const gif = GIFEncoder();

      if (file.type === "video/x-forma-sample") {
        // Fallback deterministic animation frames if browser lacks MediaRecorder WebM
        const w = targetWidth;
        const h = Math.round((w * 9) / 16);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context unavailable.");
        const totalFrames = fps * 2;
        for (let f = 0; f < totalFrames; f++) {
          const t = f / Math.max(1, totalFrames - 1);
          ctx.fillStyle = "#FFFAF6";
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = "#EEE8E2";
          ctx.lineWidth = 2;
          ctx.strokeRect(20, 20, w - 40, h - 40);
          ctx.fillStyle = "#F28B45";
          ctx.beginPath();
          ctx.arc(60 + t * (w - 120), h / 2, Math.round(h * 0.12), 0, Math.PI * 2);
          ctx.fill();
          const { data } = ctx.getImageData(0, 0, w, h);
          const palette = quantize(data, 256);
          const index = applyPalette(data, palette);
          gif.writeFrame(index, w, h, {
            palette,
            delay: delayMs,
            repeat: loopForever ? 0 : -1,
          });
        }
        gif.finish();
        const gifBlob = new Blob([new Uint8Array(gif.bytes())], {
          type: "image/gif",
        });
        return {
          outputFileName: "forma-motion-demo.gif",
          originalMetric: "2.0s clip",
          outputMetric: `${totalFrames} frames (${formatBytes(gifBlob.size)})`,
          deltaLabel: `${fps} fps · ${w}px`,
          summaryNote: `Encoded ${totalFrames} frames with adaptive 256-color quantization.`,
          previewLines: [
            `Dimensions: ${w} × ${h} px`,
            `Frame rate: ${fps} fps (${totalFrames} frames)`,
            `Looping: ${loopForever ? "Continuous" : "Play once"}`,
          ],
          downloadLabel: "Download GIF",
          downloadBlob: gifBlob,
          previewImageUrl: URL.createObjectURL(gifBlob),
        };
      }

      const videoUrl = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.src = videoUrl;

      try {
        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => resolve();
          video.onerror = () =>
            reject(
              new Error(
                "Could not decode this video in the browser. Try an MP4 (H.264) or WebM clip."
              )
            );
        });

        const duration = Math.min(8, Math.max(0.5, video.duration || 2));
        const srcW = video.videoWidth || 480;
        const srcH = video.videoHeight || 270;
        const w = Math.min(targetWidth, srcW);
        const h = Math.max(1, Math.round((w / srcW) * srcH));

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) throw new Error("Canvas context unavailable.");

        const totalFrames = Math.max(2, Math.min(96, Math.floor(duration * fps)));
        for (let i = 0; i < totalFrames; i++) {
          const seekTime = Math.min(duration - 0.02, (i / totalFrames) * duration);
          await new Promise<void>((resolve) => {
            const onSeeked = () => {
              video.removeEventListener("seeked", onSeeked);
              resolve();
            };
            video.addEventListener("seeked", onSeeked);
            video.currentTime = seekTime;
          });
          ctx.drawImage(video, 0, 0, w, h);
          const { data } = ctx.getImageData(0, 0, w, h);
          const palette = quantize(data, 256);
          const index = applyPalette(data, palette);
          gif.writeFrame(index, w, h, {
            palette,
            delay: delayMs,
            repeat: loopForever ? 0 : -1,
          });
        }

        gif.finish();
        const gifBlob = new Blob([new Uint8Array(gif.bytes())], {
          type: "image/gif",
        });
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        return {
          outputFileName: `${baseName}.gif`,
          originalMetric: `${duration.toFixed(1)}s (${formatBytes(file.size)})`,
          outputMetric: `${totalFrames} frames (${formatBytes(gifBlob.size)})`,
          deltaLabel: `${fps} fps · ${w}px`,
          summaryNote: `Encoded ${totalFrames} frames (${w} × ${h} px) directly in browser.`,
          previewLines: [
            `Dimensions: ${w} × ${h} px`,
            `Frame rate: ${fps} fps · ${totalFrames} frames`,
            `Output size: ${formatBytes(gifBlob.size)}`,
          ],
          downloadLabel: "Download GIF",
          downloadBlob: gifBlob,
          previewImageUrl: URL.createObjectURL(gifBlob),
        };
      } finally {
        URL.revokeObjectURL(videoUrl);
      }
    }

    case "pdf-to-word": {
      const file = files[0];
      if (!file) {
        throw new Error("Please drop a .pdf file or click Use sample file.");
      }

      const arrayBuffer = await file.arrayBuffer();
      let pdf;
      try {
        pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      } catch {
        throw new Error(
          "Could not read this PDF document. Ensure it is an unencrypted PDF."
        );
      }

      const includePageBreaks = Boolean(settings.includePageBreaks ?? true);
      const addPageHeaders = Boolean(settings.addPageHeaders ?? false);

      const children: Paragraph[] = [];
      const excerptLines: string[] = [];
      let totalWords = 0;

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();

        if (addPageHeaders) {
          children.push(
            new Paragraph({
              text: `Page ${pageNum}`,
              heading: HeadingLevel.HEADING_2,
            })
          );
        }

        // Group text items into visual lines by Y position
        const linesMap = new Map<number, string[]>();
        for (const item of content.items) {
          if ("str" in item && item.str.trim()) {
            const y = Math.round((item.transform?.[5] ?? 0) / 4) * 4;
            const list = linesMap.get(y) ?? [];
            list.push(item.str);
            linesMap.set(y, list);
          }
        }

        const sortedYs = Array.from(linesMap.keys()).sort((a, b) => b - a);
        if (sortedYs.length === 0) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `[Page ${pageNum}: no selectable text layer detected]`,
                  italics: true,
                }),
              ],
            })
          );
        } else {
          for (const y of sortedYs) {
            const lineText = (linesMap.get(y) ?? []).join(" ").replace(/\s+/g, " ").trim();
            if (!lineText) continue;
            totalWords += lineText.split(/\s+/).length;
            if (excerptLines.length < 10) excerptLines.push(lineText);
            children.push(
              new Paragraph({
                children: [new TextRun(lineText)],
                spacing: { after: 120 },
              })
            );
          }
        }

        if (includePageBreaks && pageNum < pdf.numPages) {
          children.push(new Paragraph({ children: [new PageBreak()] }));
        }
      }

      const docxDoc = new Document({
        sections: [{ children }],
      });
      const outBlob = await Packer.toBlob(docxDoc);
      const baseName = file.name.replace(/\.pdf$/i, "");

      return {
        outputFileName: `${baseName}.docx`,
        originalMetric: `${pdf.numPages} PDF ${pdf.numPages === 1 ? "page" : "pages"} (${formatBytes(file.size)})`,
        outputMetric: `${totalWords} words (${formatBytes(outBlob.size)})`,
        deltaLabel: "DOCX ready",
        summaryNote: `Extracted text across ${pdf.numPages} page(s) into a Microsoft Word (.docx) file.`,
        previewLines:
          excerptLines.length > 0
            ? excerptLines
            : ["Document created. Open the .docx file in Word or Google Docs."],
        downloadLabel: "Download DOCX File",
        downloadBlob: outBlob,
      };
    }

    case "svg-optimizer": {
      const file = files[0];
      if (!file) throw new Error("Please drop an .svg file or click Use sample file.");
      const raw = await file.text();
      if (!raw.includes("<svg")) {
        throw new Error("The selected file does not contain valid <svg> markup.");
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(raw, "image/svg+xml");
      const parserError = doc.querySelector("parsererror");
      if (parserError) {
        throw new Error("Invalid SVG XML syntax. Please check the file structure.");
      }

      const svgEl = doc.documentElement;
      doc.querySelectorAll("metadata, title, desc").forEach((node) => node.remove());

      const walkAndClean = (el: Element) => {
        Array.from(el.attributes).forEach((attr) => {
          if (
            attr.name.startsWith("inkscape:") ||
            attr.name.startsWith("sodipodi:") ||
            attr.name.startsWith("xmlns:inkscape") ||
            attr.name.startsWith("xmlns:sodipodi") ||
            attr.name === "data-name"
          ) {
            el.removeAttribute(attr.name);
          }
        });
        const precision = Number(settings.precision ?? 2);
        [
          "d",
          "x",
          "y",
          "width",
          "height",
          "rx",
          "ry",
          "cx",
          "cy",
          "r",
          "stroke-width",
        ].forEach((numAttr) => {
          const val = el.getAttribute(numAttr);
          if (val) {
            const rounded = val.replace(/-?\d+\.\d+/g, (m) =>
              Number(parseFloat(m).toFixed(precision)).toString()
            );
            el.setAttribute(numAttr, rounded);
          }
        });
        Array.from(el.children).forEach(walkAndClean);
      };

      walkAndClean(svgEl);

      if (settings.preserveViewBox && !svgEl.getAttribute("viewBox")) {
        const w = parseFloat(svgEl.getAttribute("width") || "32");
        const h = parseFloat(svgEl.getAttribute("height") || "32");
        if (!Number.isNaN(w) && !Number.isNaN(h)) {
          svgEl.setAttribute("viewBox", `0 0 ${w} ${h}`);
        }
      }

      const serializer = new XMLSerializer();
      const cleaned = serializer
        .serializeToString(svgEl)
        .replace(/>\s+</g, "><")
        .replace(/\s{2,}/g, " ")
        .trim();

      const outBlob = new Blob([cleaned], { type: "image/svg+xml" });
      const baseName = file.name.replace(/\.svg$/i, "");
      return {
        outputFileName: `${baseName}-clean.svg`,
        originalMetric: formatBytes(file.size),
        outputMetric: formatBytes(outBlob.size),
        deltaLabel: calcDeltaPercent(file.size, outBlob.size),
        summaryNote: "Removed editor metadata, comments, and rounded path coordinates.",
        previewLines: [cleaned],
        fullTextOutput: cleaned,
        downloadLabel: "Download Clean SVG",
        downloadBlob: outBlob,
        previewImageUrl: URL.createObjectURL(outBlob),
      };
    }

    case "compress-pdf": {
      const file = files[0];
      if (!file) throw new Error("Please select a .pdf file or click Use sample file.");
      const bytes = await file.arrayBuffer();
      let pdfDoc: PDFDocument;
      try {
        pdfDoc = await PDFDocument.load(bytes);
      } catch {
        throw new Error(
          "Could not read this PDF. It may be corrupted or encrypted with an opening password."
        );
      }

      if (settings.stripMetadata) {
        pdfDoc.setTitle("");
        pdfDoc.setAuthor("");
        pdfDoc.setSubject("");
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer("");
        pdfDoc.setCreator("");
      }

      const outBytes = await pdfDoc.save({
        useObjectStreams: Boolean(settings.useObjectStreams ?? true),
      });
      const outBlob = new Blob([new Uint8Array(outBytes)], {
        type: "application/pdf",
      });
      const baseName = file.name.replace(/\.pdf$/i, "");
      const pageCount = pdfDoc.getPageCount();

      return {
        outputFileName: `${baseName}-optimized.pdf`,
        originalMetric: `${formatBytes(file.size)} (${pageCount} pp)`,
        outputMetric: `${formatBytes(outBlob.size)} (${pageCount} pp)`,
        deltaLabel: calcDeltaPercent(file.size, outBlob.size),
        summaryNote: settings.stripMetadata
          ? "Object streams packed and document metadata stripped."
          : "PDF structure repacked cleanly with original metadata kept.",
        previewLines: [
          `Output file: ${baseName}-optimized.pdf`,
          `Pages preserved: ${pageCount}`,
          `File size: ${formatBytes(file.size)} → ${formatBytes(outBlob.size)}`,
        ],
        downloadLabel: "Download Optimized PDF",
        downloadBlob: outBlob,
      };
    }

    case "merge-pdf": {
      if (files.length < 2) {
        throw new Error("Please select at least 2 PDF files (or click Use sample PDFs).");
      }
      const merged = await PDFDocument.create();
      const targetMode = String(settings.pageSize ?? "original");
      const fileSummaries: string[] = [];

      for (const file of files) {
        let src: PDFDocument;
        try {
          src = await PDFDocument.load(await file.arrayBuffer());
        } catch {
          throw new Error(
            `Could not read "${file.name}". Ensure it is an unencrypted PDF.`
          );
        }
        const indices = src.getPageIndices();
        const copied = await merged.copyPages(src, indices);
        copied.forEach((page) => {
          if (targetMode === "a4") {
            const { width, height } = page.getSize();
            const [targetW, targetH] = PageSizes.A4;
            const scale = Math.min(targetW / width, targetH / height);
            page.scale(scale, scale);
            page.setSize(targetW, targetH);
          } else if (targetMode === "letter") {
            const { width, height } = page.getSize();
            const [targetW, targetH] = PageSizes.Letter;
            const scale = Math.min(targetW / width, targetH / height);
            page.scale(scale, scale);
            page.setSize(targetW, targetH);
          }
          merged.addPage(page);
        });
        fileSummaries.push(`${file.name} (${indices.length} pp)`);
      }

      const outBytes = await merged.save();
      const outBlob = new Blob([new Uint8Array(outBytes)], {
        type: "application/pdf",
      });
      const totalBefore = files.reduce((acc, f) => acc + f.size, 0);

      return {
        outputFileName: "Merged-Document.pdf",
        originalMetric: `${files.length} PDF files (${formatBytes(totalBefore)})`,
        outputMetric: `${merged.getPageCount()} pages (${formatBytes(outBlob.size)})`,
        deltaLabel: "Merged",
        summaryNote: `Combined ${files.length} documents in order (${targetMode} sizing).`,
        previewLines: fileSummaries,
        downloadLabel: "Download Merged PDF",
        downloadBlob: outBlob,
      };
    }

    case "archive-extractor": {
      const file = files[0];
      if (!file) throw new Error("Please drop a .zip archive or click Use sample file.");
      let zip: JSZip;
      try {
        zip = await JSZip.loadAsync(await file.arrayBuffer());
      } catch {
        throw new Error("Could not read this file as a valid ZIP archive.");
      }

      const skipSys = Boolean(settings.skipSystemFiles ?? true);
      const allFiles = Object.values(zip.files).filter((entry) => !entry.dir);
      const filtered = allFiles.filter((entry) => {
        if (!skipSys) return true;
        const lower = entry.name.toLowerCase();
        return (
          !lower.startsWith("__macosx/") &&
          !lower.endsWith("/.ds_store") &&
          lower !== ".ds_store" &&
          !lower.endsWith("thumbs.db")
        );
      });

      const entries: ExtractedZipEntry[] = [];
      const cleanZip = new JSZip();

      for (const entry of filtered) {
        const data = await entry.async("uint8array");
        cleanZip.file(entry.name, data);
        entries.push({
          name: entry.name,
          sizeBytes: data.byteLength,
          sizeFormatted: formatBytes(data.byteLength),
          getBlob: () => entry.async("blob"),
        });
      }

      const cleanBlob = await cleanZip.generateAsync({ type: "blob" });
      const baseName = file.name.replace(/\.zip$/i, "");
      const skippedCount = allFiles.length - filtered.length;

      return {
        outputFileName: `${baseName}-clean.zip`,
        originalMetric: `${allFiles.length} entries (${formatBytes(file.size)})`,
        outputMetric: `${entries.length} clean files`,
        deltaLabel:
          skippedCount > 0
            ? `${skippedCount} OS ${skippedCount === 1 ? "file" : "files"} skipped`
            : "Verified ZIP",
        summaryNote:
          "Click any file below to extract it directly, or download the cleaned bundle.",
        previewLines: entries.slice(0, 12).map((e) => `${e.name} (${e.sizeFormatted})`),
        downloadLabel: "Download Clean ZIP",
        downloadBlob: cleanBlob,
        extractedEntries: entries,
      };
    }

    case "audio-converter": {
      const file = files[0];
      if (!file) {
        throw new Error("Please drop an audio file or click Use sample file.");
      }

      const decoded = await decodeAnyAudioToBuffer(file);
      const targetFmt = String(settings.targetFormat ?? "mp3").toLowerCase();
      const targetRateSetting = String(settings.sampleRate ?? "original");
      const targetChSetting = String(settings.channels ?? "original");
      const bitrate = Number(settings.bitrate ?? 192);
      const normalize = Boolean(settings.normalize ?? false);

      const desiredRate =
        targetRateSetting === "original"
          ? decoded.sampleRate
          : Number(targetRateSetting) || decoded.sampleRate;
      const desiredChannels =
        targetChSetting === "original"
          ? decoded.numberOfChannels
          : Math.min(2, Math.max(1, Number(targetChSetting) || decoded.numberOfChannels));

      const processedBuf = await resampleAndNormalizeAudioBuffer(
        decoded,
        desiredRate,
        desiredChannels,
        normalize
      );

      let outBlob: Blob;
      let previewBlob: Blob | null = null;

      if (targetFmt === "mp3") {
        outBlob = encodeAudioBufferToMp3(processedBuf, bitrate);
        previewBlob = outBlob;
      } else if (targetFmt === "wav") {
        outBlob = encodeAudioBufferToWav(processedBuf);
        previewBlob = outBlob;
      } else if (targetFmt === "flac") {
        outBlob = encodeAudioBufferToFlac(processedBuf);
        previewBlob = outBlob;
      } else if (targetFmt === "aiff") {
        outBlob = encodeAudioBufferToAiff(processedBuf);
        previewBlob = encodeAudioBufferToWav(processedBuf);
      } else if (targetFmt === "caf") {
        outBlob = encodeAudioBufferToCaf(processedBuf);
        previewBlob = encodeAudioBufferToWav(processedBuf);
      } else if (targetFmt === "au") {
        outBlob = encodeAudioBufferToAu(processedBuf);
        previewBlob = encodeAudioBufferToWav(processedBuf);
      } else if (targetFmt === "webm" || targetFmt === "ogg") {
        outBlob = await encodeAudioBufferViaMediaRecorder(processedBuf, targetFmt);
        previewBlob = outBlob;
      } else {
        throw new Error(`Unsupported target audio format: ${targetFmt}`);
      }

      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const outName = `${baseName}.${targetFmt}`;

      return {
        outputFileName: outName,
        originalMetric: `${decoded.duration.toFixed(2)}s (${formatBytes(file.size)})`,
        outputMetric: `${targetFmt.toUpperCase()} (${formatBytes(outBlob.size)})`,
        deltaLabel: calcDeltaPercent(file.size, outBlob.size),
        summaryNote: `Converted to ${targetFmt.toUpperCase()} · ${processedBuf.sampleRate} Hz · ${processedBuf.numberOfChannels === 1 ? "Mono" : "Stereo"}${targetFmt === "mp3" ? ` · ${bitrate} kbps` : ""}.`,
        previewLines: [
          `Duration: ${processedBuf.duration.toFixed(2)} seconds`,
          `Sample rate: ${processedBuf.sampleRate} Hz · Channels: ${processedBuf.numberOfChannels}`,
          `Output format: ${targetFmt.toUpperCase()} (${formatBytes(outBlob.size)})`,
        ],
        downloadLabel: `Download ${targetFmt.toUpperCase()} Audio`,
        downloadBlob: outBlob,
        previewAudioUrl: previewBlob ? URL.createObjectURL(previewBlob) : undefined,
      };
    }

    case "trim-audio": {
      const file = files[0];
      if (!file) throw new Error("Please drop an audio file or click Use sample file.");

      const decoded = await decodeAnyAudioToBuffer(file);
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();

      const startPct = Number(settings.startPercent ?? 0) / 100;
      const endPct = Math.max(startPct + 0.05, Number(settings.endPercent ?? 80) / 100);
      const startSample = Math.floor(decoded.length * startPct);
      const endSample = Math.min(decoded.length, Math.floor(decoded.length * endPct));
      const trimmedLen = Math.max(1, endSample - startSample);

      const trimmedBuf = ctx.createBuffer(
        decoded.numberOfChannels,
        trimmedLen,
        decoded.sampleRate
      );

      const fadeSamples = Math.min(
        Math.floor(trimmedLen / 2),
        Math.floor(Number(settings.fadeDuration ?? 0.5) * decoded.sampleRate)
      );

      let peak = 0;
      for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
        const src = decoded.getChannelData(ch);
        const dst = trimmedBuf.getChannelData(ch);
        for (let i = 0; i < trimmedLen; i++) {
          let sample = src[startSample + i];
          if (fadeSamples > 0) {
            if (i < fadeSamples) sample *= i / fadeSamples;
            else if (i > trimmedLen - fadeSamples) {
              sample *= (trimmedLen - i) / fadeSamples;
            }
          }
          dst[i] = sample;
          const abs = Math.abs(sample);
          if (abs > peak) peak = abs;
        }
      }

      if (settings.normalize && peak > 0.0001) {
        const gain = 0.891 / peak;
        for (let ch = 0; ch < trimmedBuf.numberOfChannels; ch++) {
          const dst = trimmedBuf.getChannelData(ch);
          for (let i = 0; i < trimmedLen; i++) {
            dst[i] = Math.max(-1, Math.min(1, dst[i] * gain));
          }
        }
      }

      const wavBlob = encodeAudioBufferToWav(trimmedBuf);
      await ctx.close();

      const origDur = decoded.duration.toFixed(2);
      const outDur = trimmedBuf.duration.toFixed(2);
      const baseName = file.name.replace(/\.[^/.]+$/, "");

      return {
        outputFileName: `${baseName}-trimmed.wav`,
        originalMetric: `${origDur}s (${formatBytes(file.size)})`,
        outputMetric: `${outDur}s WAV (${formatBytes(wavBlob.size)})`,
        deltaLabel: `${Math.round((endPct - startPct) * 100)}% kept`,
        summaryNote: `16-bit PCM WAV · ${decoded.sampleRate} Hz · ${decoded.numberOfChannels === 1 ? "Mono" : "Stereo"}.`,
        previewLines: [
          `Trim window: ${(decoded.duration * startPct).toFixed(2)}s → ${(decoded.duration * endPct).toFixed(2)}s`,
          `Fade in/out: ${Number(settings.fadeDuration ?? 0.5)}s`,
          `Peak normalized: ${settings.normalize ? "Yes (-1 dBFS)" : "Off"}`,
        ],
        downloadLabel: "Download Trimmed WAV",
        downloadBlob: wavBlob,
        previewAudioUrl: URL.createObjectURL(wavBlob),
      };
    }

    case "compound-calculator": {
      const initial = Math.max(0, Number(calculatorInputs.initial) || 0);
      const monthly = Math.max(0, Number(calculatorInputs.monthly) || 0);
      const annualRate =
        Math.max(0, Number(calculatorInputs.annualRate) || 0) / 100;
      const years = Math.max(1, Number(settings.years ?? 10));
      const freq = String(settings.compounding ?? "monthly");
      const periodsPerYear = freq === "annually" ? 1 : freq === "quarterly" ? 4 : 12;
      const inflationAdjust = Boolean(settings.inflationAdjust);

      const csvRows = [
        "Year,Total Contributed,Projected Balance,Total Interest",
      ];
      const previewLines: string[] = [];

      let balance = initial;
      let totalContributed = initial;
      const monthlyRate =
        Math.pow(1 + annualRate / periodsPerYear, periodsPerYear / 12) - 1;

      const fmt = (n: number) =>
        n.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        });

      for (let y = 1; y <= years; y++) {
        for (let m = 1; m <= 12; m++) {
          balance = balance * (1 + monthlyRate) + monthly;
          totalContributed += monthly;
        }
        const effectiveBalance = inflationAdjust
          ? balance / Math.pow(1.025, y)
          : balance;
        const interest = effectiveBalance - totalContributed;
        csvRows.push(
          `${y},${Math.round(totalContributed)},${Math.round(effectiveBalance)},${Math.round(interest)}`
        );
        if (y === 1 || y === Math.ceil(years / 2) || y === years) {
          previewLines.push(
            `Year ${y}: ${fmt(effectiveBalance)} (Contributed ${fmt(totalContributed)} · Interest ${fmt(interest)})`
          );
        }
      }

      const finalVal = inflationAdjust
        ? balance / Math.pow(1.025, years)
        : balance;
      const totalInterest = finalVal - totalContributed;
      const csvText = csvRows.join("\n");
      const blob = new Blob([csvText], { type: "text/csv" });

      return {
        outputFileName: `compound-schedule-${years}yr.csv`,
        originalMetric: `${fmt(totalContributed)} contributed`,
        outputMetric: `${fmt(finalVal)} projected`,
        deltaLabel: `${totalInterest >= 0 ? "+" : ""}${fmt(totalInterest)} interest`,
        summaryNote: `${years}-year horizon compounded ${freq} at ${(annualRate * 100).toFixed(1)}% APR${inflationAdjust ? " (inflation-adjusted)" : ""}.`,
        previewLines,
        fullTextOutput: csvText,
        downloadLabel: "Download CSV Schedule",
        downloadBlob: blob,
      };
    }

    default:
      throw new Error("Unsupported tool.");
  }
}

function encodeAudioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numChannels * 2;
  const arrayBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(arrayBuffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + length, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, length, true);

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

function encodeImageDataToBmp(imgData: ImageData): Blob {
  const { width, height, data } = imgData;
  const rowStride = Math.ceil((width * 3) / 4) * 4;
  const pixelArraySize = rowStride * height;
  const fileSize = 54 + pixelArraySize;
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // BMP File Header (14 bytes)
  view.setUint8(0, 0x42); // 'B'
  view.setUint8(1, 0x4d); // 'M'
  view.setUint32(2, fileSize, true);
  view.setUint32(6, 0, true);
  view.setUint32(10, 54, true);

  // DIB Header BITMAPINFOHEADER (40 bytes)
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true); // bottom-up
  view.setUint16(26, 1, true); // planes
  view.setUint16(28, 24, true); // 24-bit BGR
  view.setUint32(30, 0, true); // BI_RGB
  view.setUint32(34, pixelArraySize, true);
  view.setInt32(38, 2835, true);
  view.setInt32(42, 2835, true);
  view.setUint32(46, 0, true);
  view.setUint32(50, 0, true);

  const bytes = new Uint8Array(buffer);
  for (let y = 0; y < height; y++) {
    const srcRow = height - 1 - y;
    const dstRowOffset = 54 + y * rowStride;
    for (let x = 0; x < width; x++) {
      const s = (srcRow * width + x) * 4;
      const d = dstRowOffset + x * 3;
      bytes[d] = data[s + 2]; // B
      bytes[d + 1] = data[s + 1]; // G
      bytes[d + 2] = data[s]; // R
    }
  }

  return new Blob([buffer], { type: "image/bmp" });
}

async function encodePngToIco(
  pngBlob: Blob,
  width: number,
  height: number
): Promise<Blob> {
  const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
  const headerSize = 6 + 16; // ICONDIR (6) + ICONDIRENTRY (16)
  const buffer = new ArrayBuffer(headerSize + pngBytes.byteLength);
  const view = new DataView(buffer);

  // ICONDIR
  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type 1 = ICO
  view.setUint16(4, 1, true); // image count

  // ICONDIRENTRY
  view.setUint8(6, width >= 256 ? 0 : width);
  view.setUint8(7, height >= 256 ? 0 : height);
  view.setUint8(8, 0); // palette colors
  view.setUint8(9, 0); // reserved
  view.setUint16(10, 1, true); // color planes
  view.setUint16(12, 32, true); // bits per pixel
  view.setUint32(14, pngBytes.byteLength, true);
  view.setUint32(18, headerSize, true);

  new Uint8Array(buffer, headerSize).set(pngBytes);
  return new Blob([buffer], { type: "image/x-icon" });
}

function encodeImageDataToTiff(imgData: ImageData): Blob {
  const { width, height, data } = imgData;
  const pixelBytesLen = width * height * 4;
  const headerSize = 8;
  const pixelOffset = headerSize;
  const ifdOffset = pixelOffset + pixelBytesLen;
  const numEntries = 10;
  const ifdSize = 2 + numEntries * 12 + 4;
  const extraOffset = ifdOffset + ifdSize;
  // BitsPerSample (4 x uint16 = 8 bytes)
  const totalSize = extraOffset + 8;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // Little-endian TIFF header ("II", 42, IFD offset)
  view.setUint8(0, 0x49);
  view.setUint8(1, 0x49);
  view.setUint16(2, 42, true);
  view.setUint32(4, ifdOffset, true);

  // Copy RGBA pixels
  new Uint8Array(buffer, pixelOffset, pixelBytesLen).set(data);

  // Write BitsPerSample array [8, 8, 8, 8]
  for (let i = 0; i < 4; i++) {
    view.setUint16(extraOffset + i * 2, 8, true);
  }

  // Write IFD
  let p = ifdOffset;
  view.setUint16(p, numEntries, true);
  p += 2;

  const writeTag = (
    tag: number,
    type: number,
    count: number,
    valueOrOffset: number
  ) => {
    view.setUint16(p, tag, true);
    view.setUint16(p + 2, type, true);
    view.setUint32(p + 4, count, true);
    view.setUint32(p + 8, valueOrOffset, true);
    p += 12;
  };

  // Tags must be sorted ascending by tag ID
  writeTag(256, 4, 1, width); // ImageWidth
  writeTag(257, 4, 1, height); // ImageLength
  writeTag(258, 3, 4, extraOffset); // BitsPerSample
  writeTag(259, 3, 1, 1); // Compression = None
  writeTag(262, 3, 1, 2); // PhotometricInterpretation = RGB
  writeTag(273, 4, 1, pixelOffset); // StripOffsets
  writeTag(277, 3, 1, 4); // SamplesPerPixel = 4 (RGBA)
  writeTag(278, 4, 1, height); // RowsPerStrip
  writeTag(279, 4, 1, pixelBytesLen); // StripByteCounts
  writeTag(338, 3, 1, 2); // ExtraSamples = Unassociated alpha

  view.setUint32(p, 0, true); // Next IFD = 0
  return new Blob([buffer], { type: "image/tiff" });
}

// ---------- Universal Audio Decoders & Encoders ----------

async function decodeAnyAudioToBuffer(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  const view = new DataView(arrayBuffer);
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const ctx = new AudioCtx();

  try {
    // Check for AIFF / AIFC ("FORM....AIFF" or "FORM....AIFC")
    if (
      arrayBuffer.byteLength > 16 &&
      readAscii(view, 0, 4) === "FORM" &&
      (readAscii(view, 8, 4) === "AIFF" || readAscii(view, 8, 4) === "AIFC")
    ) {
      return decodeAiffPcm(view, ctx);
    }

    // Check for Sun/NeXT AU (".snd")
    if (arrayBuffer.byteLength > 24 && readAscii(view, 0, 4) === ".snd") {
      return decodeAuPcm(view, ctx);
    }

    try {
      return await ctx.decodeAudioData(arrayBuffer.slice(0));
    } catch {
      throw new Error(
        `Could not decode "${file.name}". Try MP3, WAV, M4A, AAC, OGG, FLAC, WebM, AIFF, or AU.`
      );
    }
  } finally {
    await ctx.close();
  }
}

function readAscii(view: DataView, offset: number, len: number): string {
  let out = "";
  for (let i = 0; i < len && offset + i < view.byteLength; i++) {
    out += String.fromCharCode(view.getUint8(offset + i));
  }
  return out;
}

function readFloat80BE(view: DataView, offset: number): number {
  const expon = ((view.getUint8(offset) & 0x7f) << 8) | view.getUint8(offset + 1);
  const hiMant = view.getUint32(offset + 2, false);
  const loMant = view.getUint32(offset + 6, false);
  if (expon === 0 && hiMant === 0 && loMant === 0) return 0;
  const sign = view.getUint8(offset) & 0x80 ? -1 : 1;
  const f = hiMant * Math.pow(2, expon - 16383 - 31) + loMant * Math.pow(2, expon - 16383 - 63);
  return sign * f;
}

function decodeAiffPcm(view: DataView, ctx: AudioContext): AudioBuffer {
  let offset = 12;
  let numChannels = 1;
  let numFrames = 0;
  let bitDepth = 16;
  let sampleRate = 44100;
  let ssndOffset = 0;
  let ssndDataSize = 0;

  while (offset + 8 <= view.byteLength) {
    const id = readAscii(view, offset, 4);
    const size = view.getUint32(offset + 4, false);
    const body = offset + 8;
    if (id === "COMM" && body + 18 <= view.byteLength) {
      numChannels = view.getInt16(body, false);
      numFrames = view.getUint32(body + 2, false);
      bitDepth = view.getInt16(body + 6, false);
      sampleRate = Math.round(readFloat80BE(view, body + 8)) || 44100;
    } else if (id === "SSND" && body + 8 <= view.byteLength) {
      const innerOffset = view.getUint32(body, false);
      ssndOffset = body + 8 + innerOffset;
      ssndDataSize = Math.max(0, size - 8 - innerOffset);
    }
    offset = body + size + (size % 2);
  }

  if (ssndOffset === 0 || numFrames === 0 || (bitDepth !== 16 && bitDepth !== 8)) {
    throw new Error("Only uncompressed 8-bit or 16-bit PCM AIFF files are supported.");
  }

  const bytesPerSample = bitDepth / 8;
  const maxFrames = Math.min(
    numFrames,
    Math.floor(ssndDataSize / (numChannels * bytesPerSample))
  );
  const buffer = ctx.createBuffer(numChannels, maxFrames, sampleRate);

  for (let ch = 0; ch < numChannels; ch++) {
    const channelData = buffer.getChannelData(ch);
    for (let i = 0; i < maxFrames; i++) {
      const pos = ssndOffset + (i * numChannels + ch) * bytesPerSample;
      if (bitDepth === 16) {
        channelData[i] = view.getInt16(pos, false) / 32768;
      } else {
        channelData[i] = view.getInt8(pos) / 128;
      }
    }
  }
  return buffer;
}

function decodeAuPcm(view: DataView, ctx: AudioContext): AudioBuffer {
  const dataOffset = view.getUint32(4, false);
  const dataSize = view.getUint32(8, false);
  const encoding = view.getUint32(12, false);
  const sampleRate = view.getUint32(16, false) || 44100;
  const channels = view.getUint32(20, false) || 1;

  if (encoding !== 3) {
    throw new Error("Only 16-bit linear PCM .au files are supported.");
  }

  const byteLen =
    dataSize === 0xffffffff
      ? view.byteLength - dataOffset
      : Math.min(dataSize, view.byteLength - dataOffset);
  const frames = Math.floor(byteLen / (channels * 2));
  const buffer = ctx.createBuffer(channels, frames, sampleRate);

  for (let ch = 0; ch < channels; ch++) {
    const channelData = buffer.getChannelData(ch);
    for (let i = 0; i < frames; i++) {
      const pos = dataOffset + (i * channels + ch) * 2;
      channelData[i] = view.getInt16(pos, false) / 32768;
    }
  }
  return buffer;
}

async function resampleAndNormalizeAudioBuffer(
  source: AudioBuffer,
  targetRate: number,
  targetChannels: number,
  normalize: boolean
): Promise<AudioBuffer> {
  let result = source;

  if (
    source.sampleRate !== targetRate ||
    source.numberOfChannels !== targetChannels
  ) {
    const targetLength = Math.max(1, Math.round(source.duration * targetRate));
    const offline = new OfflineAudioContext(targetChannels, targetLength, targetRate);
    const srcNode = offline.createBufferSource();
    srcNode.buffer = source;
    srcNode.connect(offline.destination);
    srcNode.start(0);
    result = await offline.startRendering();
  }

  if (normalize) {
    let peak = 0;
    for (let ch = 0; ch < result.numberOfChannels; ch++) {
      const data = result.getChannelData(ch);
      for (let i = 0; i < data.length; i++) {
        const abs = Math.abs(data[i]);
        if (abs > peak) peak = abs;
      }
    }
    if (peak > 0.0001) {
      const gain = 0.891 / peak;
      for (let ch = 0; ch < result.numberOfChannels; ch++) {
        const data = result.getChannelData(ch);
        for (let i = 0; i < data.length; i++) {
          data[i] = Math.max(-1, Math.min(1, data[i] * gain));
        }
      }
    }
  }

  return result;
}

function floatToInt16(floatArr: Float32Array): Int16Array {
  const out = new Int16Array(floatArr.length);
  for (let i = 0; i < floatArr.length; i++) {
    const s = Math.max(-1, Math.min(1, floatArr[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

function encodeAudioBufferToMp3(buffer: AudioBuffer, kbps: number): Blob {
  const channels = Math.min(2, buffer.numberOfChannels);
  const encoder = new Mp3Encoder(channels, buffer.sampleRate, kbps);
  const left = floatToInt16(buffer.getChannelData(0));
  const right =
    channels === 2 ? floatToInt16(buffer.getChannelData(1)) : undefined;

  const mp3Chunks: Uint8Array[] = [];
  const blockSize = 1152;
  for (let i = 0; i < left.length; i += blockSize) {
    const lChunk = left.subarray(i, i + blockSize);
    const rChunk = right ? right.subarray(i, i + blockSize) : undefined;
    const encoded = encoder.encodeBuffer(lChunk, rChunk);
    if (encoded.length > 0) mp3Chunks.push(new Uint8Array(encoded));
  }
  const end = encoder.flush();
  if (end.length > 0) mp3Chunks.push(new Uint8Array(end));

  return new Blob(mp3Chunks as BlobPart[], { type: "audio/mpeg" });
}

function encodeAudioBufferToAiff(buffer: AudioBuffer): Blob {
  const ch = buffer.numberOfChannels;
  const frames = buffer.length;
  const pcmBytes = frames * ch * 2;
  const totalSize = 12 + 26 + 16 + pcmBytes;
  const ab = new ArrayBuffer(totalSize);
  const view = new DataView(ab);

  const writeStr = (pos: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(pos + i, str.charCodeAt(i));
  };

  writeStr(0, "FORM");
  view.setUint32(4, totalSize - 8, false);
  writeStr(8, "AIFF");

  // COMM chunk
  writeStr(12, "COMM");
  view.setUint32(16, 18, false);
  view.setInt16(20, ch, false);
  view.setUint32(22, frames, false);
  view.setInt16(26, 16, false);
  writeFloat80BE(view, 28, buffer.sampleRate);

  // SSND chunk
  writeStr(38, "SSND");
  view.setUint32(42, 8 + pcmBytes, false);
  view.setUint32(46, 0, false);
  view.setUint32(50, 0, false);

  let pos = 54;
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < ch; c++) {
      const s = Math.max(-1, Math.min(1, buffer.getChannelData(c)[i]));
      view.setInt16(pos, s < 0 ? s * 0x8000 : s * 0x7fff, false);
      pos += 2;
    }
  }

  return new Blob([ab], { type: "audio/aiff" });
}

function writeFloat80BE(view: DataView, offset: number, value: number): void {
  if (value <= 0) {
    for (let i = 0; i < 10; i++) view.setUint8(offset + i, 0);
    return;
  }
  const exp = Math.floor(Math.log2(value));
  const biasedExp = exp + 16383;
  const mantissa = value / Math.pow(2, exp); // in [1, 2)
  const hi = Math.floor(mantissa * 0x80000000);
  const lo = Math.floor((mantissa * 0x80000000 - hi) * 0x100000000);
  view.setUint16(offset, biasedExp & 0x7fff, false);
  view.setUint32(offset + 2, hi >>> 0, false);
  view.setUint32(offset + 6, lo >>> 0, false);
}

function encodeAudioBufferToAu(buffer: AudioBuffer): Blob {
  const ch = buffer.numberOfChannels;
  const frames = buffer.length;
  const pcmBytes = frames * ch * 2;
  const ab = new ArrayBuffer(24 + pcmBytes);
  const view = new DataView(ab);

  view.setUint32(0, 0x2e736e64, false); // ".snd"
  view.setUint32(4, 24, false); // header size
  view.setUint32(8, pcmBytes, false);
  view.setUint32(12, 3, false); // 16-bit linear PCM
  view.setUint32(16, buffer.sampleRate, false);
  view.setUint32(20, ch, false);

  let pos = 24;
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < ch; c++) {
      const s = Math.max(-1, Math.min(1, buffer.getChannelData(c)[i]));
      view.setInt16(pos, s < 0 ? s * 0x8000 : s * 0x7fff, false);
      pos += 2;
    }
  }
  return new Blob([ab], { type: "audio/basic" });
}

function encodeAudioBufferToCaf(buffer: AudioBuffer): Blob {
  const ch = buffer.numberOfChannels;
  const frames = buffer.length;
  const pcmBytes = frames * ch * 2;
  // caff header (8) + desc chunk (12 + 32) + data chunk (12 + 4 + pcmBytes)
  const total = 8 + 44 + 16 + pcmBytes;
  const ab = new ArrayBuffer(total);
  const view = new DataView(ab);

  const writeStr = (pos: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(pos + i, str.charCodeAt(i));
  };

  writeStr(0, "caff");
  view.setUint16(4, 1, false);
  view.setUint16(6, 0, false);

  // desc chunk
  writeStr(8, "desc");
  view.setUint32(12, 0, false);
  view.setUint32(16, 32, false);
  view.setFloat64(20, buffer.sampleRate, false);
  writeStr(28, "lpcm");
  view.setUint32(32, 0, false); // big-endian signed int
  view.setUint32(36, ch * 2, false); // bytes per packet
  view.setUint32(40, 1, false); // frames per packet
  view.setUint32(44, ch, false); // channels per frame
  view.setUint32(48, 16, false); // bits per channel

  // data chunk
  writeStr(52, "data");
  view.setUint32(56, 0, false);
  view.setUint32(60, 4 + pcmBytes, false);
  view.setUint32(64, 0, false); // edit count

  let pos = 68;
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < ch; c++) {
      const s = Math.max(-1, Math.min(1, buffer.getChannelData(c)[i]));
      view.setInt16(pos, s < 0 ? s * 0x8000 : s * 0x7fff, false);
      pos += 2;
    }
  }
  return new Blob([ab], { type: "audio/x-caf" });
}

function flacCrc8(bytes: Uint8Array, len: number): number {
  let crc = 0;
  for (let i = 0; i < len; i++) {
    crc ^= bytes[i];
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x80 ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff;
    }
  }
  return crc;
}

function flacCrc16(bytes: Uint8Array): number {
  let crc = 0;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i] << 8;
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x8005) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc;
}

function encodeFlacUtf8(n: number): number[] {
  if (n < 0x80) return [n];
  if (n < 0x800) return [0xc0 | (n >> 6), 0x80 | (n & 0x3f)];
  if (n < 0x10000) {
    return [0xe0 | (n >> 12), 0x80 | ((n >> 6) & 0x3f), 0x80 | (n & 0x3f)];
  }
  return [
    0xf0 | (n >> 18),
    0x80 | ((n >> 12) & 0x3f),
    0x80 | ((n >> 6) & 0x3f),
    0x80 | (n & 0x3f),
  ];
}

function encodeAudioBufferToFlac(buffer: AudioBuffer): Blob {
  const channels = Math.min(2, buffer.numberOfChannels);
  const sampleRate = buffer.sampleRate;
  const totalSamples = buffer.length;
  const blockSize = 4096;

  const chunks: Uint8Array[] = [];

  // 1. "fLaC" + STREAMINFO (last-metadata-block flag = 0x80, type = 0, length = 34)
  const header = new Uint8Array(42);
  header[0] = 0x66; // f
  header[1] = 0x4c; // L
  header[2] = 0x61; // a
  header[3] = 0x43; // C
  header[4] = 0x80;
  header[5] = 0;
  header[6] = 0;
  header[7] = 34;

  const hView = new DataView(header.buffer);
  hView.setUint16(8, blockSize, false); // min block size
  hView.setUint16(10, blockSize, false); // max block size
  // min/max frame size = 0 (bytes 12..17)
  // 20 bits sampleRate | 3 bits (channels-1) | 5 bits (bps-1=15) | 36 bits totalSamples
  const srHi = (sampleRate >> 12) & 0xff;
  const srMid = (sampleRate >> 4) & 0xff;
  const srLo = sampleRate & 0x0f;
  const chBits = (channels - 1) & 0x07;
  const bpsBits = 15; // 16-bit - 1
  const totalHi = Math.floor(totalSamples / 0x100000000) & 0x0f;
  header[18] = srHi;
  header[19] = srMid;
  header[20] = (srLo << 4) | (chBits << 1) | ((bpsBits >> 4) & 0x01);
  header[21] = ((bpsBits & 0x0f) << 4) | totalHi;
  hView.setUint32(22, totalSamples >>> 0, false);
  chunks.push(header);

  // Sample rate code lookup
  const srLookup: Record<number, number> = {
    8000: 4,
    16000: 5,
    22050: 6,
    32000: 7,
    44100: 9,
    48000: 10,
    96000: 11,
  };
  const srCode = srLookup[sampleRate] ?? (sampleRate <= 65535 ? 13 : 0);

  const channelArrays = Array.from({ length: channels }, (_, c) =>
    floatToInt16(buffer.getChannelData(c))
  );

  let frameIndex = 0;
  for (let offset = 0; offset < totalSamples; offset += blockSize) {
    const curBlock = Math.min(blockSize, totalSamples - offset);
    const bsCode = curBlock === 4096 ? 12 : 7; // 7 => 16-bit (blocksize-1)

    const frameNumBytes = encodeFlacUtf8(frameIndex);
    const hdrBuf = new Uint8Array(4 + frameNumBytes.length + (bsCode === 7 ? 2 : 0) + (srCode === 13 ? 2 : 0) + 1);
    let hp = 0;
    hdrBuf[hp++] = 0xff;
    hdrBuf[hp++] = 0xf8; // fixed blocksize sync
    hdrBuf[hp++] = (bsCode << 4) | srCode;
    hdrBuf[hp++] = ((channels - 1) << 4) | (4 << 1); // 4 = 16-bit sample size
    for (const b of frameNumBytes) hdrBuf[hp++] = b;
    if (bsCode === 7) {
      hdrBuf[hp++] = ((curBlock - 1) >> 8) & 0xff;
      hdrBuf[hp++] = (curBlock - 1) & 0xff;
    }
    if (srCode === 13) {
      hdrBuf[hp++] = (sampleRate >> 8) & 0xff;
      hdrBuf[hp++] = sampleRate & 0xff;
    }
    hdrBuf[hp] = flacCrc8(hdrBuf, hp);

    // Frame body: each channel has 1-byte verbatim subframe header (0x00) + curBlock * 2 bytes
    const subframesLen = channels * (1 + curBlock * 2);
    const frameBytes = new Uint8Array(hdrBuf.length + subframesLen + 2);
    frameBytes.set(hdrBuf, 0);

    let fp = hdrBuf.length;
    const fView = new DataView(frameBytes.buffer);
    for (let c = 0; c < channels; c++) {
      frameBytes[fp++] = 0x00; // SUBFRAME_VERBATIM, 0 wasted bits
      const src = channelArrays[c];
      for (let s = 0; s < curBlock; s++) {
        fView.setInt16(fp, src[offset + s], false);
        fp += 2;
      }
    }

    const crc16 = flacCrc16(frameBytes.subarray(0, fp));
    frameBytes[fp++] = (crc16 >> 8) & 0xff;
    frameBytes[fp] = crc16 & 0xff;

    chunks.push(frameBytes);
    frameIndex++;
  }

  return new Blob(chunks as BlobPart[], { type: "audio/flac" });
}

async function encodeAudioBufferViaMediaRecorder(
  buffer: AudioBuffer,
  fmt: "webm" | "ogg"
): Promise<Blob> {
  if (typeof MediaRecorder === "undefined") {
    throw new Error(`MediaRecorder is unavailable in this browser for ${fmt.toUpperCase()} encoding.`);
  }
  const candidateMimes =
    fmt === "ogg"
      ? ["audio/ogg;codecs=opus", "audio/ogg"]
      : ["audio/webm;codecs=opus", "audio/webm"];
  const mime = candidateMimes.find((m) => MediaRecorder.isTypeSupported(m));
  if (!mime) {
    throw new Error(
      `Your current browser does not support ${fmt.toUpperCase()} MediaRecorder encoding. Try MP3, WAV, FLAC, or AIFF instead.`
    );
  }
  if (buffer.duration > 20) {
    throw new Error(
      `Browser ${fmt.toUpperCase()} recording runs in real time and is limited to clips up to 20s. Use MP3, WAV, or FLAC for instant conversion of longer files.`
    );
  }

  const ctx = new AudioContext({ sampleRate: buffer.sampleRate });
  const dest = ctx.createMediaStreamDestination();
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.connect(dest);

  const recorder = new MediaRecorder(dest.stream, { mimeType: mime });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const done = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mime }));
  });

  recorder.start();
  src.start();
  await new Promise<void>((resolve) => {
    src.onended = () => {
      if (recorder.state !== "inactive") recorder.stop();
      resolve();
    };
  });

  const outBlob = await done;
  await ctx.close();
  return outBlob;
}


