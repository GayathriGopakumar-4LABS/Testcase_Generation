"use client";

import { FileJson, FileText, FileCode } from "lucide-react";
import type { Generation } from "@/types";
import { generationsApi } from "@/lib/api/generations";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TestCaseCard } from "./test-case-card";

interface Props {
  generation: Generation;
}

const FORMAT_EXT: Record<string, string> = { json: "json", csv: "csv", markdown: "md" };

function downloadFromUrl(url: string, token: string, filename: string) {
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.blob())
    .then((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    });
}

export function ResultsPanel({ generation }: Props) {
  const { token } = useAuthStore();

  const handleExport = (format: "json" | "csv" | "markdown") => {
    if (!token) return;
    const filename = `${generation.title}.${FORMAT_EXT[format]}`;
    downloadFromUrl(generationsApi.exportUrl(generation.id, format), token, filename);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{generation.title}</h2>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="secondary">{generation.test_type}</Badge>
            <span className="text-sm text-muted-foreground">
              {generation.test_case_count} test case{generation.test_case_count !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Export buttons */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport("json")}>
            <FileJson className="h-4 w-4" />
            JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
            <FileText className="h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("markdown")}>
            <FileCode className="h-4 w-4" />
            Markdown
          </Button>
        </div>
      </div>

      {/* Test case cards */}
      <div className="space-y-3">
        {generation.test_cases.map((tc, i) => (
          <TestCaseCard key={i} testCase={tc as any} index={i} />
        ))}
      </div>
    </div>
  );
}
