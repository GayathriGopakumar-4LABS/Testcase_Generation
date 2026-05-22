"use client";

import { useState } from "react";
import { Plus, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectDialog } from "@/components/projects/project-dialog";
import { useProjects, useDeleteProject } from "@/hooks/use-projects";

export default function ProjectsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: projects = [], isLoading } = useProjects();
  const deleteProject = useDeleteProject();

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading…" : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="font-medium text-gray-900">No projects yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a project to start organizing your test cases.
          </p>
          <Button className="mt-4 gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Create first project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={(id) => deleteProject.mutate(id)}
            />
          ))}
        </div>
      )}

      <ProjectDialog open={createOpen} onOpenChange={setCreateOpen} mode="create" />
    </div>
  );
}
