import { ToolIconKey } from "@/src/components/ToolIcon";

export interface CategoryItem {
  slug: string;
  name: string;
  description: string;
  toolCount: number;
  icon: ToolIconKey;
}

export type ToolSettingControl =
  | {
      id: string;
      type: "select";
      label: string;
      description?: string;
      defaultValue: string;
      options: { value: string; label: string }[];
    }
  | {
      id: string;
      type: "slider";
      label: string;
      description?: string;
      defaultValue: number;
      min: number;
      max: number;
      step: number;
      unit: string;
    }
  | {
      id: string;
      type: "switch";
      label: string;
      description?: string;
      defaultValue: boolean;
    };

export interface ToolDefinition {
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  shortDescription: string;
  longDescription: string;
  icon: ToolIconKey;
  isLive: boolean;
  isPopular?: boolean;
  isTrending?: boolean;
  isRecent?: boolean;
  addedLabel?: string;
  trendLabel?: string;
  inputType: "file" | "multi-file" | "text" | "calculator" | "unit-converter";
  acceptAttr?: string;
  acceptedFormatsLabel: string;
  maxSizeLabel: string;
  dropzoneHeadline: string;
  dropzoneSubtext: string;
  sampleFileName: string;
  sampleFileSize: string;
  sampleTextInput?: string;
  actionLabel: string;
  settings: ToolSettingControl[];
  sampleResult: {
    outputFileName: string;
    originalMetric: string;
    outputMetric: string;
    deltaLabel: string;
    summaryNote: string;
    previewLines: string[];
    downloadLabel: string;
  };
  howToSteps: {
    title: string;
    description: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

export const CATEGORIES: CategoryItem[] = [
  {
    slug: "pdf",
    name: "PDF Tools",
    description: "Compress, merge, and convert PDF documents cleanly.",
    toolCount: 14,
    icon: "pdf",
  },
  {
    slug: "image",
    name: "Image Tools",
    description: "Resize, convert formats, optimize, and adjust photos.",
    toolCount: 12,
    icon: "image",
  },
  {
    slug: "video",
    name: "Video Tools",
    description: "Convert clips into shareable looping GIF animations.",
    toolCount: 8,
    icon: "video",
  },
  {
    slug: "audio",
    name: "Audio Tools",
    description: "Cut tracks, normalize volume, and export clean WAV audio.",
    toolCount: 7,
    icon: "audio",
  },
  {
    slug: "file",
    name: "File Tools",
    description: "Inspect ZIP archives, filter clutter, and extract files.",
    toolCount: 9,
    icon: "file",
  },
  {
    slug: "text",
    name: "Text Tools",
    description: "Count words, measure reading time, and inspect copy.",
    toolCount: 11,
    icon: "text",
  },
  {
    slug: "developer",
    name: "Developer Tools",
    description: "Format JSON, convert CSV/JSON, and optimize SVGs.",
    toolCount: 15,
    icon: "developer",
  },
  {
    slug: "calculators",
    name: "Calculators",
    description: "Convert everyday units and project compound growth.",
    toolCount: 10,
    icon: "calculator",
  },
];

export const POPULAR_SEARCH_SUGGESTIONS: { label: string; slug: string }[] = [
  { label: "Image Converter", slug: "convert-webp" },
  { label: "Audio Converter", slug: "audio-converter" },
  { label: "Unit Converter", slug: "unit-converter" },
  { label: "CSV ↔ JSON", slug: "csv-json-converter" },
  { label: "PDF to Word", slug: "pdf-to-word" },
];

export const TOOLS_CATALOG: ToolDefinition[] = [
  {
    slug: "compress-pdf",
    name: "Compress PDF",
    categorySlug: "pdf",
    categoryName: "PDF Tools",
    shortDescription: "Optimize PDF structure and strip hidden metadata in your browser.",
    longDescription:
      "Clean redundant object streams and optional document metadata from PDF files locally in your browser before sharing.",
    icon: "compress",
    isLive: true,
    isPopular: true,
    isTrending: true,
    trendLabel: "Most used this week",
    inputType: "file",
    acceptAttr: ".pdf,application/pdf",
    acceptedFormatsLabel: "PDF documents (.pdf)",
    maxSizeLabel: "Up to 100 MB",
    dropzoneHeadline: "Drop your PDF document here",
    dropzoneSubtext: "Runs locally in your browser for .pdf files up to 100 MB",
    sampleFileName: "Q4-Product-Roadmap-Deck.pdf",
    sampleFileSize: "Sample 3-page PDF",
    actionLabel: "Compress PDF",
    settings: [
      {
        id: "useObjectStreams",
        type: "switch",
        label: "Compress internal PDF object streams",
        description: "Packs structural tables and cross-references efficiently.",
        defaultValue: true,
      },
      {
        id: "stripMetadata",
        type: "switch",
        label: "Remove hidden document metadata",
        description: "Strips authoring title, creator, producer, and keyword tags.",
        defaultValue: true,
      },
    ],
    sampleResult: {
      outputFileName: "Q4-Product-Roadmap-Deck-compressed.pdf",
      originalMetric: "18.4 KB",
      outputMetric: "12.1 KB",
      deltaLabel: "Optimized",
      summaryNote: "PDF object streams packed and metadata removed.",
      previewLines: ["Ready to download."],
      downloadLabel: "Download Compressed PDF",
    },
    howToSteps: [
      {
        title: "Select your PDF file",
        description:
          "Drag a PDF into the workspace or load our built-in sample PDF.",
      },
      {
        title: "Choose optimization options",
        description:
          "Enable object stream packing and strip hidden authoring metadata.",
      },
      {
        title: "Inspect and download",
        description:
          "Review the exact output size and save your cleaned PDF immediately.",
      },
    ],
    faqs: [
      {
        question: "Do my PDFs leave my device?",
        answer:
          "No. Everything runs locally inside your browser using client-side PDF processing.",
      },
      {
        question: "Will compressing a PDF make text blurry?",
        answer:
          "No. Vector text and line art remain completely crisp and selectable.",
      },
    ],
  },
  {
    slug: "pdf-to-word",
    name: "PDF to Word",
    categorySlug: "pdf",
    categoryName: "PDF Tools",
    shortDescription: "Convert text-based PDF documents into editable DOCX files.",
    longDescription:
      "Extract structured paragraphs and headings from PDF documents and export a genuine Microsoft Word (.docx) file directly in your browser.",
    icon: "export",
    isLive: true,
    isTrending: true,
    trendLabel: "Popular document converter",
    inputType: "file",
    acceptAttr: ".pdf,application/pdf",
    acceptedFormatsLabel: "PDF documents (.pdf)",
    maxSizeLabel: "Up to 50 MB",
    dropzoneHeadline: "Drop a PDF to convert to DOCX",
    dropzoneSubtext: "Extracts text page-by-page into an editable Word document",
    sampleFileName: "Annual-Partner-Brief.pdf",
    sampleFileSize: "Sample 2-page PDF",
    actionLabel: "Convert to Word",
    settings: [
      {
        id: "includePageBreaks",
        type: "switch",
        label: "Insert page breaks between PDF pages",
        description: "Preserves page boundaries cleanly inside Word.",
        defaultValue: true,
      },
      {
        id: "addPageHeaders",
        type: "switch",
        label: "Include section heading per page",
        defaultValue: false,
      },
    ],
    sampleResult: {
      outputFileName: "Annual-Partner-Brief.docx",
      originalMetric: "2 pages PDF",
      outputMetric: "DOCX Ready",
      deltaLabel: "Converted",
      summaryNote: "Exported as an editable .docx document.",
      previewLines: ["Ready to download."],
      downloadLabel: "Download DOCX File",
    },
    howToSteps: [
      {
        title: "Upload your PDF",
        description: "Drop a PDF document or test with the built-in sample brief.",
      },
      {
        title: "Choose page formatting",
        description: "Decide whether to preserve page breaks and page headers.",
      },
      {
        title: "Download your Word file",
        description: "Save the generated .docx file and open it in Word or Docs.",
      },
    ],
    faqs: [
      {
        question: "Does it work on text-based PDFs?",
        answer:
          "Yes. All selectable text across every page is extracted and structured into Word paragraphs.",
      },
      {
        question: "What about image-only scanned PDFs?",
        answer:
          "Browser extraction reads embedded PDF text layers; image-only scans require server OCR.",
      },
    ],
  },
  {
    slug: "convert-webp",
    name: "Image Format Converter",
    categorySlug: "image",
    categoryName: "Image Tools",
    shortDescription: "Convert between PNG, JPG, WebP, GIF, BMP, ICO, TIFF, SVG, and AVIF.",
    longDescription:
      "Convert virtually any image format (PNG, JPG, WebP, GIF, BMP, SVG, ICO, AVIF) into any target image extension directly in your browser.",
    icon: "convert",
    isLive: true,
    isPopular: true,
    isRecent: true,
    addedLabel: "Universal image converter",
    inputType: "file",
    acceptAttr: "image/*,.png,.jpg,.jpeg,.webp,.gif,.bmp,.svg,.ico,.avif",
    acceptedFormatsLabel: "PNG, JPG, WebP, GIF, BMP, SVG, ICO, AVIF",
    maxSizeLabel: "Up to 50 MB",
    dropzoneHeadline: "Drop any image file to convert",
    dropzoneSubtext: "Converts locally to PNG, JPG, WebP, GIF, BMP, ICO, TIFF, SVG, or AVIF",
    sampleFileName: "product-shot-01.png",
    sampleFileSize: "1200 × 675 px sample",
    actionLabel: "Convert Image",
    settings: [
      {
        id: "targetFormat",
        type: "select",
        label: "Convert to format",
        defaultValue: "webp",
        options: [
          { value: "webp", label: "WebP (.webp) — Modern web format" },
          { value: "png", label: "PNG (.png) — Lossless & transparent" },
          { value: "jpeg", label: "JPG / JPEG (.jpg) — Universal photo" },
          { value: "gif", label: "GIF (.gif) — 256-color indexed" },
          { value: "bmp", label: "BMP (.bmp) — Uncompressed bitmap" },
          { value: "ico", label: "ICO (.ico) — Desktop & favicon" },
          { value: "tiff", label: "TIFF (.tiff) — Uncompressed archival" },
          { value: "svg", label: "SVG (.svg) — Scalable wrapper" },
          { value: "avif", label: "AVIF (.avif) — High-efficiency" },
        ],
      },
      {
        id: "quality",
        type: "slider",
        label: "Compression quality (WebP / JPG / AVIF)",
        defaultValue: 88,
        min: 40,
        max: 100,
        step: 2,
        unit: "%",
      },
      {
        id: "bgFill",
        type: "select",
        label: "Background for non-transparent formats (JPG / BMP)",
        defaultValue: "#FFFFFF",
        options: [
          { value: "#FFFFFF", label: "White background" },
          { value: "#202020", label: "Dark charcoal (#202020)" },
          { value: "#FFFAF6", label: "Warm off-white (#FFFAF6)" },
        ],
      },
    ],
    sampleResult: {
      outputFileName: "product-shot-01.webp",
      originalMetric: "PNG",
      outputMetric: "WebP",
      deltaLabel: "Converted",
      summaryNote: "Converted cleanly in your browser.",
      previewLines: ["Ready to download."],
      downloadLabel: "Download Converted Image",
    },
    howToSteps: [
      {
        title: "Drop any image file",
        description:
          "Upload PNG, JPG, WebP, GIF, BMP, SVG, ICO, or AVIF straight into the workspace.",
      },
      {
        title: "Choose any output extension",
        description:
          "Select from 9 supported formats and set quality or opaque background fill.",
      },
      {
        title: "Preview and download",
        description:
          "Inspect the converted visual preview and file dimensions before saving.",
      },
    ],
    faqs: [
      {
        question: "Which image extensions can I convert between?",
        answer:
          "You can upload PNG, JPG/JPEG, WebP, GIF, BMP, SVG, ICO, or AVIF and export to PNG, JPG, WebP, GIF, BMP, ICO, TIFF, SVG, or AVIF.",
      },
      {
        question: "What happens when converting a transparent PNG to JPG or BMP?",
        answer:
          "Because JPG and BMP do not support alpha transparency, transparent areas are cleanly filled with your chosen background color instead of turning black.",
      },
      {
        question: "How is ICO sizing handled?",
        answer:
          "Standard Windows .ico files support icons up to 256 × 256 px, so larger images are automatically scaled down proportionally to fit inside 256 × 256 px.",
      },
    ],
  },
  {
    slug: "resize-image",
    name: "Resize Image",
    categorySlug: "image",
    categoryName: "Image Tools",
    shortDescription: "Scale PNG, JPG, or WebP dimensions with crisp resampling.",
    longDescription:
      "Adjust pixel width, output format, and quality for web publishing, product thumbnails, or social posts directly in your browser.",
    icon: "resize",
    isLive: true,
    isPopular: true,
    isTrending: true,
    trendLabel: "Rising for web assets",
    inputType: "file",
    acceptAttr: "image/png,image/jpeg,image/webp,image/avif",
    acceptedFormatsLabel: "PNG, JPG, WebP, AVIF",
    maxSizeLabel: "Up to 50 MB",
    dropzoneHeadline: "Drop an image file to resize",
    dropzoneSubtext: "Works locally with PNG, JPG, WebP, and AVIF images",
    sampleFileName: "editorial-studio-banner.png",
    sampleFileSize: "1200 × 675 px sample",
    actionLabel: "Resize Image",
    settings: [
      {
        id: "presetSize",
        type: "select",
        label: "Output width",
        defaultValue: "1200",
        options: [
          { value: "600", label: "600 px wide (Compact thumbnail)" },
          { value: "800", label: "800 px wide (Blog inline)" },
          { value: "1200", label: "1200 px wide (Social share)" },
          { value: "1600", label: "1600 px wide (Hero banner)" },
          { value: "half", label: "50% of original dimensions" },
        ],
      },
      {
        id: "outputFormat",
        type: "select",
        label: "Export format",
        defaultValue: "image/webp",
        options: [
          { value: "image/webp", label: "WebP (Smallest web asset)" },
          { value: "image/png", label: "PNG (Lossless & transparency)" },
          { value: "image/jpeg", label: "JPEG (Universal compatibility)" },
        ],
      },
      {
        id: "quality",
        type: "slider",
        label: "Export quality",
        defaultValue: 88,
        min: 40,
        max: 100,
        step: 2,
        unit: "%",
      },
    ],
    sampleResult: {
      outputFileName: "editorial-studio-banner-1200w.webp",
      originalMetric: "1200 × 675 px",
      outputMetric: "1200 × 675 px",
      deltaLabel: "Ready",
      summaryNote: "Resampled directly in your browser.",
      previewLines: ["Output ready for download."],
      downloadLabel: "Download Resized Image",
    },
    howToSteps: [
      {
        title: "Add your source image",
        description:
          "Drop a PNG, JPG, or WebP file onto the upload zone or try the sample image.",
      },
      {
        title: "Set width, format, and quality",
        description:
          "Pick a target width preset, choose WebP/PNG/JPEG, and dial in quality.",
      },
      {
        title: "Preview and download",
        description:
          "Inspect the live image preview and file weight savings before saving.",
      },
    ],
    faqs: [
      {
        question: "Does resizing preserve transparency in PNGs?",
        answer:
          "Yes, whenever you choose PNG or WebP as the export format.",
      },
    ],
  },
  {
    slug: "video-to-gif",
    name: "Video to GIF",
    categorySlug: "video",
    categoryName: "Video Tools",
    shortDescription: "Convert MP4 or WebM clips into crisp looping GIF animations.",
    longDescription:
      "Turn product demos and short video clips into lightweight, looping GIFs directly in your browser with adjustable FPS and width.",
    icon: "gif",
    isLive: true,
    isTrending: true,
    isRecent: true,
    addedLabel: "Live GIF encoder",
    trendLabel: "Popular for product demos",
    inputType: "file",
    acceptAttr: "video/mp4,video/webm,video/quicktime,video/*",
    acceptedFormatsLabel: "MP4, WebM, MOV",
    maxSizeLabel: "Clips up to 10s",
    dropzoneHeadline: "Drop a short video clip here",
    dropzoneSubtext: "Captures frames from MP4 or WebM locally into an animated GIF",
    sampleFileName: "forma-motion-demo.webm",
    sampleFileSize: "2.0s animated sample clip",
    actionLabel: "Convert to GIF",
    settings: [
      {
        id: "fps",
        type: "slider",
        label: "Frame rate",
        defaultValue: 12,
        min: 6,
        max: 20,
        step: 2,
        unit: "fps",
      },
      {
        id: "width",
        type: "select",
        label: "Output width",
        defaultValue: "480",
        options: [
          { value: "360", label: "360 px (Fast & compact)" },
          { value: "480", label: "480 px (Balanced)" },
          { value: "640", label: "640 px (Sharp UI)" },
        ],
      },
      {
        id: "loopForever",
        type: "switch",
        label: "Loop animation continuously",
        defaultValue: true,
      },
    ],
    sampleResult: {
      outputFileName: "motion-demo.gif",
      originalMetric: "2.0s clip",
      outputMetric: "Animated GIF",
      deltaLabel: "12 fps",
      summaryNote: "Encoded with adaptive 256-color quantization.",
      previewLines: ["GIF ready to preview and download."],
      downloadLabel: "Download GIF",
    },
    howToSteps: [
      {
        title: "Upload your video clip",
        description: "Drop an MP4 or WebM clip, or generate our sample animated clip.",
      },
      {
        title: "Pick frame rate and width",
        description:
          "12 fps at 480 px delivers crisp motion while keeping file weight low.",
      },
      {
        title: "Preview and download GIF",
        description:
          "Watch the animated GIF preview directly in the workspace and save.",
      },
    ],
    faqs: [
      {
        question: "How long can the converted clip be?",
        answer:
          "Browser frame encoding captures up to the first 8 seconds of your video to keep memory fast and responsive.",
      },
      {
        question: "Can I make the GIF play only once?",
        answer:
          "Yes. Toggle off continuous looping in the settings panel.",
      },
    ],
  },
  {
    slug: "csv-json-converter",
    name: "CSV ↔ JSON Converter",
    categorySlug: "developer",
    categoryName: "Developer Tools",
    shortDescription: "Convert cleanly between spreadsheet CSV tables and JSON arrays.",
    longDescription:
      "Transform CSV tables into structured JSON arrays or flatten JSON object arrays back into RFC-4180 CSV with configurable delimiters.",
    icon: "spreadsheet",
    isLive: true,
    isPopular: true,
    isRecent: true,
    addedLabel: "New converter",
    inputType: "text",
    acceptedFormatsLabel: "CSV text or JSON array",
    maxSizeLabel: "Up to 10 MB text",
    dropzoneHeadline: "Paste CSV or JSON array below",
    dropzoneSubtext: "Auto-detects CSV vs JSON or pick a conversion direction",
    sampleFileName: "team-directory.csv",
    sampleFileSize: "Sample 4-row CSV",
    sampleTextInput:
      "name,role,location,active\nMaya Lin,Product Designer,San Francisco,true\nDaniel Okafor,Systems Engineer,London,true\nSofia Alvarez,Operations Lead,Madrid,false",
    actionLabel: "Convert Data",
    settings: [
      {
        id: "direction",
        type: "select",
        label: "Conversion direction",
        defaultValue: "auto",
        options: [
          { value: "auto", label: "Auto-detect input format" },
          { value: "csv-to-json", label: "CSV → JSON" },
          { value: "json-to-csv", label: "JSON → CSV" },
        ],
      },
      {
        id: "delimiter",
        type: "select",
        label: "CSV delimiter",
        defaultValue: ",",
        options: [
          { value: ",", label: "Comma (,)" },
          { value: ";", label: "Semicolon (;)" },
          { value: "\t", label: "Tab (TSV)" },
        ],
      },
      {
        id: "prettyJson",
        type: "switch",
        label: "Pretty-print JSON output (2 spaces)",
        defaultValue: true,
      },
    ],
    sampleResult: {
      outputFileName: "converted-data.json",
      originalMetric: "3 CSV rows",
      outputMetric: "3 JSON objects",
      deltaLabel: "Converted",
      summaryNote: "Converted cleanly in your browser.",
      previewLines: ["Ready to copy or download."],
      downloadLabel: "Download Converted File",
    },
    howToSteps: [
      {
        title: "Paste CSV or JSON",
        description: "Paste spreadsheet rows or a JSON array of objects.",
      },
      {
        title: "Pick delimiter & direction",
        description: "Use Auto-detect or force CSV → JSON or JSON → CSV.",
      },
      {
        title: "Copy or download",
        description: "Copy the converted output or download the .json / .csv file.",
      },
    ],
    faqs: [
      {
        question: "Does it handle quoted commas inside CSV cells?",
        answer:
          "Yes. Quoted fields containing commas or escaped quotes are parsed accurately.",
      },
    ],
  },
  {
    slug: "unit-converter",
    name: "Unit Converter",
    categorySlug: "calculators",
    categoryName: "Calculators",
    shortDescription: "Convert length, weight, temperature, data size, and speed instantly.",
    longDescription:
      "Convert everyday measurements across metric, imperial, temperature, and digital storage units with a full reference table and CSV export.",
    icon: "convert",
    isLive: true,
    isPopular: true,
    isRecent: true,
    addedLabel: "New converter",
    inputType: "unit-converter",
    acceptedFormatsLabel: "Numeric measurement",
    maxSizeLabel: "Instant conversion",
    dropzoneHeadline: "Enter value and units to convert",
    dropzoneSubtext: "Choose category, source unit, and target unit",
    sampleFileName: "unit-conversions.csv",
    sampleFileSize: "Instant calculation",
    actionLabel: "Convert Units",
    settings: [
      {
        id: "precision",
        type: "slider",
        label: "Decimal places",
        defaultValue: 4,
        min: 0,
        max: 8,
        step: 1,
        unit: "dp",
      },
    ],
    sampleResult: {
      outputFileName: "unit-conversion-table.csv",
      originalMetric: "10 kilometers",
      outputMetric: "6.2137 miles",
      deltaLabel: "Length",
      summaryNote: "Full equivalent table generated.",
      previewLines: ["CSV table ready."],
      downloadLabel: "Download Conversion Table",
    },
    howToSteps: [
      {
        title: "Select measurement category",
        description: "Switch between Length, Weight, Temperature, Data Storage, or Speed.",
      },
      {
        title: "Enter value and units",
        description: "Type any number and choose your source and target units.",
      },
      {
        title: "Inspect all equivalents",
        description: "View the exact conversion plus every equivalent unit in one table.",
      },
    ],
    faqs: [
      {
        question: "Are digital storage units decimal (KB = 1000 B) or binary?",
        answer:
          "Data storage uses standard decimal SI units (1 KB = 1,000 bytes, 1 MB = 1,000 KB) for clear comparison.",
      },
    ],
  },
  {
    slug: "merge-pdf",
    name: "Merge PDF",
    categorySlug: "pdf",
    categoryName: "PDF Tools",
    shortDescription: "Combine multiple PDF documents into one ordered file.",
    longDescription:
      "Combine invoices, chapters, or signed forms into a single clean PDF package directly in your browser.",
    icon: "merge",
    isLive: true,
    isPopular: true,
    inputType: "multi-file",
    acceptAttr: ".pdf,application/pdf",
    acceptedFormatsLabel: "Multiple PDF files (.pdf)",
    maxSizeLabel: "Up to 25 files · 100 MB total",
    dropzoneHeadline: "Drop multiple PDFs to combine",
    dropzoneSubtext: "Select 2 or more .pdf files to merge into a single document",
    sampleFileName: "Agreement-Part-1.pdf + Schedule-B.pdf",
    sampleFileSize: "2 sample PDFs (4 pages total)",
    actionLabel: "Merge PDFs",
    settings: [
      {
        id: "pageSize",
        type: "select",
        label: "Page sizing behavior",
        defaultValue: "original",
        options: [
          { value: "original", label: "Keep each file's original page size" },
          { value: "a4", label: "Standardize all pages to A4" },
          { value: "letter", label: "Standardize all pages to US Letter" },
        ],
      },
    ],
    sampleResult: {
      outputFileName: "Merged-Document.pdf",
      originalMetric: "2 files",
      outputMetric: "4 pages combined",
      deltaLabel: "Ready",
      summaryNote: "Combined cleanly into one PDF document.",
      previewLines: ["Ready to download."],
      downloadLabel: "Download Merged PDF",
    },
    howToSteps: [
      {
        title: "Upload your PDF files",
        description:
          "Select or drop two or more PDF documents into the workspace.",
      },
      {
        title: "Choose page sizing",
        description:
          "Keep original page sizes or normalize pages to A4 or US Letter.",
      },
      {
        title: "Merge and download",
        description:
          "Click Merge PDFs to assemble and save the combined PDF.",
      },
    ],
    faqs: [
      {
        question: "Are my documents uploaded anywhere?",
        answer:
          "No. Merging happens locally inside your browser tab.",
      },
    ],
  },
  {
    slug: "format-json",
    name: "Format & Validate JSON",
    categorySlug: "developer",
    categoryName: "Developer Tools",
    shortDescription: "Pretty-print, minify, and validate nested JSON payloads.",
    longDescription:
      "Turn dense single-line API responses into cleanly indented JSON, catch syntax errors immediately, or minify payloads for production.",
    icon: "json",
    isLive: true,
    isPopular: true,
    isTrending: true,
    trendLabel: "Popular with developers",
    inputType: "text",
    acceptedFormatsLabel: "Raw JSON text",
    maxSizeLabel: "Up to 10 MB text",
    dropzoneHeadline: "Paste your JSON payload below",
    dropzoneSubtext: "Supports nested objects, arrays, numbers, and UTF-8 strings",
    sampleFileName: "api-response-payload.json",
    sampleFileSize: "Sample JSON payload",
    sampleTextInput:
      '{"platform":"Forma","status":"ready","categories":["PDF","Image","Developer"],"limits":{"maxUploadMb":100,"loginRequired":false}}',
    actionLabel: "Format JSON",
    settings: [
      {
        id: "indentation",
        type: "select",
        label: "Indentation style",
        defaultValue: "2spaces",
        options: [
          { value: "2spaces", label: "2 spaces (Recommended)" },
          { value: "4spaces", label: "4 spaces" },
          { value: "tab", label: "Tabs" },
          { value: "minify", label: "Minify (Single line)" },
        ],
      },
      {
        id: "sortKeys",
        type: "switch",
        label: "Sort object keys alphabetically",
        description: "Useful when comparing two configuration files side by side.",
        defaultValue: false,
      },
    ],
    sampleResult: {
      outputFileName: "formatted-payload.json",
      originalMetric: "142 chars",
      outputMetric: "Valid JSON",
      deltaLabel: "0 syntax errors",
      summaryNote: "RFC 8259 compliant JSON.",
      previewLines: ["Ready"],
      downloadLabel: "Download JSON File",
    },
    howToSteps: [
      {
        title: "Paste or load JSON",
        description:
          "Paste raw JSON text into the editor or click Load sample.",
      },
      {
        title: "Pick formatting rules",
        description:
          "Choose 2 spaces, 4 spaces, tabs, or minification, and optionally sort keys.",
      },
      {
        title: "Copy or download",
        description:
          "Copy the validated output or download it directly as a .json file.",
      },
    ],
    faqs: [
      {
        question: "What happens if my JSON has a syntax error?",
        answer:
          "The validator stops and displays the exact parser error message so you can fix the broken bracket, quote, or trailing comma.",
      },
    ],
  },
  {
    slug: "audio-converter",
    name: "Audio Format Converter",
    categorySlug: "audio",
    categoryName: "Audio Tools",
    shortDescription: "Convert between MP3, WAV, FLAC, AIFF, CAF, AU, WebM, and OGG.",
    longDescription:
      "Convert virtually any audio file (MP3, WAV, M4A, AAC, OGG, Opus, FLAC, WebM, AIFF, AU) into MP3, WAV, FLAC, AIFF, CAF, AU, WebM, or OGG directly in your browser.",
    icon: "audio",
    isLive: true,
    isPopular: true,
    isRecent: true,
    addedLabel: "Universal audio converter",
    inputType: "file",
    acceptAttr: "audio/*,.mp3,.wav,.m4a,.aac,.ogg,.opus,.flac,.webm,.aiff,.aif,.au",
    acceptedFormatsLabel: "MP3, WAV, M4A, AAC, OGG, FLAC, WebM, AIFF, AU",
    maxSizeLabel: "Up to 150 MB",
    dropzoneHeadline: "Drop any audio file to convert",
    dropzoneSubtext: "Converts locally to MP3, WAV, FLAC, AIFF, CAF, AU, WebM, or OGG",
    sampleFileName: "studio-warm-chord.wav",
    sampleFileSize: "3.0s · 44.1 kHz stereo sample",
    actionLabel: "Convert Audio",
    settings: [
      {
        id: "targetFormat",
        type: "select",
        label: "Convert to format",
        defaultValue: "mp3",
        options: [
          { value: "mp3", label: "MP3 (.mp3) — Universal compressed audio" },
          { value: "wav", label: "WAV (.wav) — Uncompressed RIFF PCM" },
          { value: "flac", label: "FLAC (.flac) — Lossless audio" },
          { value: "aiff", label: "AIFF (.aiff) — Apple uncompressed PCM" },
          { value: "caf", label: "CAF (.caf) — Apple Core Audio" },
          { value: "au", label: "AU (.au) — Sun/NeXT PCM audio" },
          { value: "webm", label: "WebM Opus (.webm) — Web audio stream" },
          { value: "ogg", label: "OGG Opus (.ogg) — Open OGG container" },
        ],
      },
      {
        id: "bitrate",
        type: "select",
        label: "MP3 Bitrate",
        defaultValue: "192",
        options: [
          { value: "128", label: "128 kbps (Compact)" },
          { value: "192", label: "192 kbps (Balanced)" },
          { value: "256", label: "256 kbps (High quality)" },
          { value: "320", label: "320 kbps (Maximum MP3)" },
        ],
      },
      {
        id: "sampleRate",
        type: "select",
        label: "Sample rate",
        defaultValue: "original",
        options: [
          { value: "original", label: "Keep original sample rate" },
          { value: "48000", label: "48,000 Hz (Studio / Video)" },
          { value: "44100", label: "44,100 Hz (CD standard)" },
          { value: "22050", label: "22,050 Hz (Voice / Compact)" },
        ],
      },
      {
        id: "channels",
        type: "select",
        label: "Channels",
        defaultValue: "original",
        options: [
          { value: "original", label: "Keep original channels" },
          { value: "2", label: "Stereo (2 channels)" },
          { value: "1", label: "Mono (1 channel)" },
        ],
      },
      {
        id: "normalize",
        type: "switch",
        label: "Normalize peak volume (-1 dBFS)",
        defaultValue: false,
      },
    ],
    sampleResult: {
      outputFileName: "studio-warm-chord.mp3",
      originalMetric: "WAV",
      outputMetric: "MP3",
      deltaLabel: "Converted",
      summaryNote: "Encoded directly in your browser.",
      previewLines: ["Audio ready to play and download."],
      downloadLabel: "Download Converted Audio",
    },
    howToSteps: [
      {
        title: "Drop any audio file",
        description:
          "Upload MP3, WAV, M4A, OGG, FLAC, WebM, AIFF, or AU, or load the built-in sample track.",
      },
      {
        title: "Choose format & audio settings",
        description:
          "Select from 8 output extensions and optionally resample rate, channels, or MP3 bitrate.",
      },
      {
        title: "Listen and download",
        description:
          "Play back the result right in the workspace and save your converted file.",
      },
    ],
    faqs: [
      {
        question: "Which audio extensions are supported?",
        answer:
          "You can import MP3, WAV, M4A, AAC, OGG, Opus, FLAC, WebM, AIFF, and AU files and export to MP3, WAV, FLAC, AIFF, CAF, AU, WebM, or OGG.",
      },
      {
        question: "Are my audio tracks uploaded to a server?",
        answer:
          "No. Decoding, resampling, and encoding run 100% locally inside your browser.",
      },
    ],
  },
  {
    slug: "trim-audio",
    name: "Trim Audio",
    categorySlug: "audio",
    categoryName: "Audio Tools",
    shortDescription: "Cut MP3, WAV, or M4A tracks with smooth fades and normalization.",
    longDescription:
      "Clip audio tracks to an exact duration window, apply smooth edge fades, normalize peak loudness, and listen before downloading as WAV.",
    icon: "trim",
    isLive: true,
    inputType: "file",
    acceptAttr: "audio/*",
    acceptedFormatsLabel: "MP3, WAV, M4A, OGG",
    maxSizeLabel: "Up to 150 MB",
    dropzoneHeadline: "Drop an audio file to trim",
    dropzoneSubtext: "Decodes MP3, WAV, M4A, and OGG locally via Web Audio",
    sampleFileName: "studio-warm-chord.wav",
    sampleFileSize: "3.0s · 44.1 kHz stereo sample",
    actionLabel: "Trim Audio",
    settings: [
      {
        id: "startPercent",
        type: "slider",
        label: "Trim start point",
        defaultValue: 0,
        min: 0,
        max: 80,
        step: 5,
        unit: "%",
      },
      {
        id: "endPercent",
        type: "slider",
        label: "Trim end point",
        defaultValue: 80,
        min: 20,
        max: 100,
        step: 5,
        unit: "%",
      },
      {
        id: "fadeDuration",
        type: "slider",
        label: "Smooth fade in / out",
        defaultValue: 0.5,
        min: 0,
        max: 3,
        step: 0.5,
        unit: "sec",
      },
      {
        id: "normalize",
        type: "switch",
        label: "Normalize peak volume (-1 dBFS)",
        defaultValue: true,
      },
    ],
    sampleResult: {
      outputFileName: "trimmed-audio.wav",
      originalMetric: "3.00 sec",
      outputMetric: "2.40 sec WAV",
      deltaLabel: "Ready",
      summaryNote: "PCM 16-bit WAV encoded in browser.",
      previewLines: ["Audio clip ready for playback and download."],
      downloadLabel: "Download Trimmed WAV",
    },
    howToSteps: [
      {
        title: "Load your audio track",
        description:
          "Drop an audio file or generate the built-in 3-second sample track.",
      },
      {
        title: "Set trim range and fades",
        description:
          "Adjust start/end sliders, fade duration, and peak normalization.",
      },
      {
        title: "Listen and export",
        description:
          "Preview the trimmed clip right in the workspace and download the WAV file.",
      },
    ],
    faqs: [
      {
        question: "Why does Trim Audio export as WAV?",
        answer:
          "Browser Web Audio decodes tracks into uncompressed PCM, which exports cleanly and losslessly as WAV without external codecs.",
      },
    ],
  },
  {
    slug: "word-counter",
    name: "Word & Reading Time Counter",
    categorySlug: "text",
    categoryName: "Text Tools",
    shortDescription: "Measure words, characters, sentences, and estimated reading time.",
    longDescription:
      "Inspect draft articles, product copy, or essays for exact word counts, sentence totals, and reading duration at your chosen pace.",
    icon: "counter",
    isLive: true,
    inputType: "text",
    acceptedFormatsLabel: "Plain text or Markdown",
    maxSizeLabel: "Unlimited characters",
    dropzoneHeadline: "Paste or write your text below",
    dropzoneSubtext: "Works instantly with articles, Markdown drafts, and copy",
    sampleFileName: "launch-announcement-draft.md",
    sampleFileSize: "Sample paragraph",
    sampleTextInput:
      "Simple tools should feel effortless from the very first click. Instead of burying everyday file tasks behind cluttered menus and popups, a calm workspace keeps your focus on the work itself.",
    actionLabel: "Analyze Text",
    settings: [
      {
        id: "readingSpeed",
        type: "slider",
        label: "Reading pace",
        defaultValue: 225,
        min: 140,
        max: 320,
        step: 5,
        unit: "wpm",
      },
      {
        id: "excludeSpaces",
        type: "switch",
        label: "Highlight character count without spaces",
        defaultValue: false,
      },
    ],
    sampleResult: {
      outputFileName: "text-metrics-summary.txt",
      originalMetric: "33 words",
      outputMetric: "~9 sec read",
      deltaLabel: "2 sentences",
      summaryNote: "Calculated from your input text.",
      previewLines: ["Ready"],
      downloadLabel: "Download Metrics Report",
    },
    howToSteps: [
      {
        title: "Paste your draft",
        description:
          "Type or paste plain text or Markdown into the main input box.",
      },
      {
        title: "Adjust reading pace",
        description:
          "Tune words-per-minute if you are preparing a spoken script or keynote.",
      },
      {
        title: "Review and export",
        description:
          "Check exact counts and download a clean metrics summary.",
      },
    ],
    faqs: [
      {
        question: "How is speaking time calculated?",
        answer:
          "Spoken presentations typically average 130–150 words per minute; slide the reading pace down to model speech timing.",
      },
    ],
  },
  {
    slug: "svg-optimizer",
    name: "SVG Optimizer",
    categorySlug: "developer",
    categoryName: "Developer Tools",
    shortDescription: "Strip editor bloat and clean vector paths for fast web icons.",
    longDescription:
      "Remove hidden Figma, Illustrator, and Sketch metadata from SVG files, round path decimals, and copy or download clean markup.",
    icon: "svg",
    isLive: true,
    isRecent: true,
    addedLabel: "Added 5 days ago",
    inputType: "file",
    acceptAttr: ".svg,image/svg+xml",
    acceptedFormatsLabel: "SVG files (.svg)",
    maxSizeLabel: "Up to 10 MB",
    dropzoneHeadline: "Drop an SVG file to optimize",
    dropzoneSubtext: "Accepts .svg icons, illustrations, and vector marks",
    sampleFileName: "brand-mark-export.svg",
    sampleFileSize: "Sample SVG with editor metadata",
    actionLabel: "Optimize SVG",
    settings: [
      {
        id: "precision",
        type: "slider",
        label: "Coordinate decimal precision",
        defaultValue: 2,
        min: 1,
        max: 4,
        step: 1,
        unit: "dp",
      },
      {
        id: "preserveViewBox",
        type: "switch",
        label: "Preserve responsive viewBox attribute",
        defaultValue: true,
      },
    ],
    sampleResult: {
      outputFileName: "brand-mark-clean.svg",
      originalMetric: "1.2 KB",
      outputMetric: "420 B",
      deltaLabel: "Smaller",
      summaryNote: "Editor metadata and redundant whitespace stripped.",
      previewLines: ["<svg viewBox=\"0 0 32 32\">...</svg>"],
      downloadLabel: "Download Clean SVG",
    },
    howToSteps: [
      {
        title: "Add your exported SVG",
        description: "Drop an SVG from Figma or Illustrator, or load the sample.",
      },
      {
        title: "Set decimal precision",
        description:
          "Use 2 decimal places for crisp icons while keeping viewBox intact.",
      },
      {
        title: "Copy or download markup",
        description: "Save the lightweight SVG ready for React or HTML.",
      },
    ],
    faqs: [
      {
        question: "Will optimizing alter my icon shapes?",
        answer:
          "At 2 or 3 decimal places, vector paths remain visually identical to the original export.",
      },
    ],
  },
  {
    slug: "archive-extractor",
    name: "Archive Inspector & Extractor",
    categorySlug: "file",
    categoryName: "File Tools",
    shortDescription: "Inspect ZIP contents and extract individual files or clean bundles.",
    longDescription:
      "Preview every file inside a .zip archive, filter out hidden OS artifacts like .DS_Store, and download individual files or a cleaned archive.",
    icon: "file",
    isLive: true,
    isRecent: true,
    addedLabel: "Added 1 week ago",
    inputType: "file",
    acceptAttr: ".zip,application/zip",
    acceptedFormatsLabel: "ZIP archives (.zip)",
    maxSizeLabel: "Up to 200 MB",
    dropzoneHeadline: "Drop a ZIP archive here",
    dropzoneSubtext: "Inspect contents and download individual files locally",
    sampleFileName: "design-handoff-assets.zip",
    sampleFileSize: "Sample 3-file ZIP archive",
    actionLabel: "Inspect Archive",
    settings: [
      {
        id: "skipSystemFiles",
        type: "switch",
        label: "Skip hidden OS files (.DS_Store, __MACOSX, Thumbs.db)",
        defaultValue: true,
      },
    ],
    sampleResult: {
      outputFileName: "design-handoff-assets-clean.zip",
      originalMetric: "4 entries",
      outputMetric: "3 clean files",
      deltaLabel: "Ready",
      summaryNote: "Inspected archive contents.",
      previewLines: ["Files ready for extraction."],
      downloadLabel: "Download Clean ZIP",
    },
    howToSteps: [
      {
        title: "Load a ZIP archive",
        description: "Drop a .zip file into the workspace or use the sample bundle.",
      },
      {
        title: "Filter OS clutter",
        description: "Optionally exclude hidden macOS and Windows metadata files.",
      },
      {
        title: "Extract individual files or ZIP",
        description: "Download any single item from the manifest or save the clean archive.",
      },
    ],
    faqs: [
      {
        question: "Does it automatically skip .DS_Store files?",
        answer: "Yes, hidden OS artifacts are filtered out by default.",
      },
    ],
  },
  {
    slug: "compound-calculator",
    name: "Compound Growth Calculator",
    categorySlug: "calculators",
    categoryName: "Calculators",
    shortDescription: "Project savings, monthly contributions, and compounding schedules.",
    longDescription:
      "Model starting balance, recurring monthly deposits, interest rate, and compounding cadence, then export the full year-by-year CSV schedule.",
    icon: "percent",
    isLive: true,
    isTrending: true,
    inputType: "calculator",
    acceptedFormatsLabel: "Numeric inputs",
    maxSizeLabel: "Instant calculation",
    dropzoneHeadline: "Enter your savings parameters",
    dropzoneSubtext: "Adjust principal, monthly contribution, and annual return",
    sampleFileName: "compound-schedule.csv",
    sampleFileSize: "Real-time projection",
    actionLabel: "Calculate Growth",
    settings: [
      {
        id: "compounding",
        type: "select",
        label: "Compounding frequency",
        defaultValue: "monthly",
        options: [
          { value: "monthly", label: "Monthly (12× / year)" },
          { value: "quarterly", label: "Quarterly (4× / year)" },
          { value: "annually", label: "Annually (1× / year)" },
        ],
      },
      {
        id: "years",
        type: "slider",
        label: "Investment horizon",
        defaultValue: 10,
        min: 1,
        max: 40,
        step: 1,
        unit: "yrs",
      },
      {
        id: "inflationAdjust",
        type: "switch",
        label: "Adjust projected balance for 2.5% annual inflation",
        defaultValue: false,
      },
    ],
    sampleResult: {
      outputFileName: "compound-schedule-10yr.csv",
      originalMetric: "$47,000 contributed",
      outputMetric: "$68,542 projected",
      deltaLabel: "+$21,542 interest",
      summaryNote: "Calculated year-by-year compounding schedule.",
      previewLines: ["CSV schedule ready"],
      downloadLabel: "Download CSV Schedule",
    },
    howToSteps: [
      {
        title: "Enter your starting numbers",
        description: "Set initial principal, monthly deposit, and expected annual return.",
      },
      {
        title: "Pick compounding cadence",
        description: "Switch between monthly, quarterly, or annual compounding.",
      },
      {
        title: "Inspect or export schedule",
        description: "Review yearly milestones and download the full CSV table.",
      },
    ],
    faqs: [
      {
        question: "How is inflation adjustment applied?",
        answer:
          "When enabled, each future year's nominal balance is discounted by (1.025)^year to reflect today's purchasing power.",
      },
    ],
  },
];

export function getToolBySlug(slug: string): ToolDefinition {
  return TOOLS_CATALOG.find((t) => t.slug === slug) ?? TOOLS_CATALOG[0];
}
