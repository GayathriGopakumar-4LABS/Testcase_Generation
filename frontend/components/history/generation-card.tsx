"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Download, Trash2, FileJson, FileText, FileCode } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { GenerationListItem } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { TestCaseCard } from "@/components/generate/test-case-card";
import { useGeneration } from "@/hooks/use-generations";
import { generationsApi } from "@/lib/api/generations";
import { useAuthStore } from "@/store/auth-store";

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

interface Props {
  item: GenerationListItem;
  projectName?: string;
  onDelete: (id: string) => void;
}

export function GenerationCard({ item, projectName, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { token } = useAuthStore();

  // Only fetch full data when expanded
  const { data: full, isLoading } = useGeneration(expanded ? item.id : "");

  const handleExport = (format: "json" | "csv" | "markdown") => {
    if (!token) return;
    const filename = `${item.title}.${FORMAT_EXT[format]}`;
    downloadFromUrl(generationsApi.exportUrl(item.id, format), token, filename);
  };

  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none py-4"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="truncate font-medium text-gray-900">{item.title}</span>
              <Badge variant="outline" className="shrink-0 text-xs">
                {item.test_type}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {projectName && <span>{projectName}</span>}
              {projectName && <span>·</span>}
              <span>{item.test_case_count} test cases</span>
              <span>·</span>
              <span>{formatDate(item.created_at)}</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {/* Export dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem onClick={() => handleExport("json")}>
                  <FileJson className="h-4 w-4" /> Export JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  <FileText className="h-4 w-4" /> Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("markdown")}>
                  <FileCode className="h-4 w-4" /> Export Markdown
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="border-t pt-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : full ? (
            <div className="space-y-3">
              {full.test_cases.map((tc, i) => (
                <TestCaseCard key={i} testCase={tc as any} index={i} />
              ))}
            </div>
          ) : null}
        </CardContent>
      )}
    </Card>
  );
}
