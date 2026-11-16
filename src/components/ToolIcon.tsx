import React from "react";
import {
  FileText,
  Image as ImageIcon,
  Video,
  AudioLines,
  FolderArchive,
  Type,
  Code2,
  Calculator,
  Minimize2,
  Layers,
  Maximize2,
  Scissors,
  FileSpreadsheet,
  Braces,
  Hash,
  Percent,
  Sparkles,
  FileOutput,
  Film,
  Clock,
  FileCode,
  ArrowRightLeft,
  type LucideIcon,
} from "lucide-react";

export type ToolIconKey =
  | "pdf"
  | "image"
  | "video"
  | "audio"
  | "file"
  | "text"
  | "developer"
  | "calculator"
  | "compress"
  | "merge"
  | "resize"
  | "trim"
  | "spreadsheet"
  | "json"
  | "counter"
  | "percent"
  | "clean"
  | "export"
  | "gif"
  | "clock"
  | "svg"
  | "convert";

const ICON_MAP: Record<ToolIconKey, LucideIcon> = {
  pdf: FileText,
  image: ImageIcon,
  video: Video,
  audio: AudioLines,
  file: FolderArchive,
  text: Type,
  developer: Code2,
  calculator: Calculator,
  compress: Minimize2,
  merge: Layers,
  resize: Maximize2,
  trim: Scissors,
  spreadsheet: FileSpreadsheet,
  json: Braces,
  counter: Hash,
  percent: Percent,
  clean: Sparkles,
  export: FileOutput,
  gif: Film,
  clock: Clock,
  svg: FileCode,
  convert: ArrowRightLeft,
};

interface ToolIconProps {
  name: ToolIconKey;
  className?: string;
}

export const ToolIcon: React.FC<ToolIconProps> = ({ name, className }) => {
  const Icon = ICON_MAP[name] ?? FileText;
  return <Icon className={className} aria-hidden="true" />;
};
