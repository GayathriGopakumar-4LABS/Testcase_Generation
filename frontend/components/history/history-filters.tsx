"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TEST_TYPES } from "@/lib/utils";
import type { Project } from "@/types";

interface Filters {
  search: string;
  project_id: string;
  test_type: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  projects: Project[];
}

export function HistoryFilters({ filters, onChange, projects }: Props) {
  const hasActiveFilters =
    filters.search || filters.project_id || filters.test_type;

  const clear = () =>
    onChange({ search: "", project_id: "", test_type: "" });

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by title or requirement…"
          className="pl-9"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>

      {/* Project filter */}
      <Select
        value={filters.project_id || "all"}
        onValueChange={(v) => onChange({ ...filters, project_id: v === "all" ? "" : v })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All projects" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All projects</SelectItem>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Test type filter */}
      <Select
        value={filters.test_type || "all"}
        onValueChange={(v) => onChange({ ...filters, test_type: v === "all" ? "" : v })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {TEST_TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clear} className="gap-1 text-muted-foreground">
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
