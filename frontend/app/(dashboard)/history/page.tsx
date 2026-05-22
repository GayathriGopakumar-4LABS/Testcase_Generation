"use client";

import { useState, useMemo } from "react";
import { History } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { HistoryFilters } from "@/components/history/history-filters";
import { GenerationCard } from "@/components/history/generation-card";
import { useGenerations, useDeleteGeneration } from "@/hooks/use-generations";
import { useProjects } from "@/hooks/use-projects";

interface Filters {
  search: string;
  project_id: string;
  test_type: string;
}

export default function HistoryPage() {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    project_id: "",
    test_type: "",
  });

  const { data: projects = [] } = useProjects();
  const { data: generations = [], isLoading } = useGenerations({
    project_id: filters.project_id || undefined,
    search: filters.search || undefined,
    test_type: filters.test_type || undefined,
  });
  const deleteGeneration = useDeleteGeneration();

  const projectMap = useMemo(
    () => Object.fromEntries(projects.map((p) => [p.id, p.name])),
    [projects]
  );

  // Group by project
  const grouped = useMemo(() => {
    const map = new Map<string, typeof generations>();
    for (const gen of generations) {
      const existing = map.get(gen.project_id) ?? [];
      map.set(gen.project_id, [...existing, gen]);
    }
    return map;
  }, [generations]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <HistoryFilters filters={filters} onChange={setFilters} projects={projects} />

      {/* Results */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : generations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <History className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="font-medium text-gray-900">No generations found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {filters.search || filters.project_id || filters.test_type
              ? "Try adjusting your filters."
              : "Generate your first test cases to see them here."}
          </p>
        </div>
      ) : (
        // Grouped by project
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([projectId, gens]) => (
            <section key={projectId}>
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-700">
                <span className="text-base">
                  {projectMap[projectId] ?? "Unknown project"}
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  ({gens.length} generation{gens.length !== 1 ? "s" : ""})
                </span>
              </h3>
              <div className="space-y-3">
                {gens.map((gen) => (
                  <GenerationCard
                    key={gen.id}
                    item={gen}
                    projectName={projectMap[gen.project_id]}
                    onDelete={(id) => deleteGeneration.mutate(id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
