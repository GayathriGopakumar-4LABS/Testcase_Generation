"use client";

import { useState } from "react";
import { FolderOpen, MoreVertical, Pencil, Trash2, Sparkles, TestTube2 } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Project } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectDialog } from "./project-dialog";
import { useGenerations } from "@/hooks/use-generations";

interface Props {
  project: Project;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, onDelete }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const { data: generations = [] } = useGenerations({ project_id: project.id });
  const totalTestCases = generations.reduce((sum, g) => sum + g.test_case_count, 0);

  return (
    <>
      <Card className="group relative flex flex-col transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-gray-900">{project.name}</h3>
                <p className="text-xs text-muted-foreground">{formatDate(project.created_at)}</p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(project.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-4">
          {project.description ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
          ) : (
            <p className="text-sm italic text-muted-foreground">No description</p>
          )}

          <div className="mt-auto space-y-2 rounded-lg bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">{generations.length} generation{generations.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TestTube2 className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">{totalTestCases} test case{totalTestCases !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>

          <div>
            <Link href={`/generate?project=${project.id}`}>
              <Button size="sm" className="w-full gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                Generate tests
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <ProjectDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        project={project}
        mode="edit"
      />
    </>
  );
}
