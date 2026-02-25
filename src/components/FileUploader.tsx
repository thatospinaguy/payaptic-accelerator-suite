"use client";

import React, { useCallback, useRef } from "react";
import { FileCode, CheckCircle } from "lucide-react";
import { FormulaFile } from "@/lib/types";
import JSZip from "jszip";

interface FileUploaderProps {
  onFilesUploaded: (files: FormulaFile[]) => void;
  uploadedCount: number;
}

export default function FileUploader({
  onFilesUploaded,
  uploadedCount,
}: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readTextFile = (file: File): Promise<FormulaFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          fileName: file.name,
          content: (e.target?.result as string) || "",
        });
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const readZipFile = async (file: File): Promise<FormulaFile[]> => {
    const buffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);
    const formulaFiles: FormulaFile[] = [];

    for (const [name, entry] of Object.entries(zip.files)) {
      if (entry.dir) continue;
      // Skip hidden files and macOS resource forks
      const baseName = name.split("/").pop() || name;
      if (baseName.startsWith(".") || baseName.startsWith("__")) continue;

      const content = await entry.async("string");
      formulaFiles.push({ fileName: baseName, content });
    }

    return formulaFiles;
  };

  const processFiles = useCallback(
    async (fileList: FileList) => {
      const results: FormulaFile[] = [];

      for (const file of Array.from(fileList)) {
        if (
          file.name.endsWith(".zip") ||
          file.type === "application/zip" ||
          file.type === "application/x-zip-compressed"
        ) {
          const zipFiles = await readZipFile(file);
          results.push(...zipFiles);
        } else {
          const textFile = await readTextFile(file);
          results.push(textFile);
        }
      }

      if (results.length > 0) {
        onFilesUploaded(results);
      }
    },
    [onFilesUploaded]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
      }
    },
    [processFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  if (uploadedCount > 0) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-payaptic-emerald/30 bg-payaptic-emerald/5 p-4">
        <CheckCircle className="h-5 w-5 shrink-0 text-payaptic-emerald" />
        <span className="text-sm font-medium text-payaptic-navy">
          {uploadedCount} formula file{uploadedCount !== 1 ? "s" : ""} uploaded
        </span>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="ml-auto text-sm text-payaptic-ocean hover:underline"
        >
          Add More
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.ff,.sql,.ffl,.zip"
          multiple
          onChange={handleChange}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-payaptic-emerald/50"
    >
      <FileCode className="mx-auto mb-3 h-10 w-10 text-gray-400" />
      <p className="mb-2 text-sm text-gray-600">
        Drag and drop formula files (.txt, .ff) or a .zip archive
      </p>
      <p className="mb-4 text-xs text-gray-400">or</p>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="rounded-lg bg-payaptic-emerald px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-payaptic-emerald/90"
      >
        Browse Files
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.ff,.sql,.ffl,.zip"
        multiple
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
