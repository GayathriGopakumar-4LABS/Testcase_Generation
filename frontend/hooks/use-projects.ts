"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "@/lib/api/projects";
import { useToast } from "@/components/ui/use-toast";
import { getApiErrorMessage } from "@/lib/utils";

export const PROJECT_KEYS = {
  all: ["projects"] as const,
  detail: (id: string) => ["projects", id] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: PROJECT_KEYS.all,
    queryFn: projectsApi.list,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: PROJECT_KEYS.detail(id),
    queryFn: () => projectsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROJECT_KEYS.all });
      toast({ title: "Project created successfully" });
    },
    onError: (error) =>
      toast({
        title: "Failed to create project",
        description: getApiErrorMessage(error),
        variant: "destructive",
      }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string } }) =>
      projectsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROJECT_KEYS.all });
      toast({ title: "Project updated" });
    },
    onError: (error) =>
      toast({
        title: "Failed to update project",
        description: getApiErrorMessage(error),
        variant: "destructive",
      }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: projectsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROJECT_KEYS.all });
      toast({ title: "Project deleted" });
    },
    onError: (error) =>
      toast({
        title: "Failed to delete project",
        description: getApiErrorMessage(error),
        variant: "destructive",
      }),
  });
}
