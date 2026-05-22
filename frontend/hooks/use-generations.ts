"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { generationsApi } from "@/lib/api/generations";
import { useToast } from "@/components/ui/use-toast";
import { getApiErrorMessage } from "@/lib/utils";
import type { GenerationCreatePayload } from "@/types";

export const GEN_KEYS = {
  all: ["generations"] as const,
  filtered: (params: object) => ["generations", params] as const,
  detail: (id: string) => ["generations", id] as const,
};

export function useGenerations(params?: {
  project_id?: string;
  search?: string;
  test_type?: string;
}) {
  return useQuery({
    queryKey: GEN_KEYS.filtered(params ?? {}),
    queryFn: () => generationsApi.list(params),
  });
}

export function useGeneration(id: string) {
  return useQuery({
    queryKey: GEN_KEYS.detail(id),
    queryFn: () => generationsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateGeneration() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: GenerationCreatePayload) => generationsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GEN_KEYS.all });
      toast({ title: "Test cases generated successfully!" });
    },
    onError: (error) =>
      toast({
        title: "Generation failed",
        description: getApiErrorMessage(error),
        variant: "destructive",
      }),
  });
}

export function useDeleteGeneration() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: generationsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GEN_KEYS.all });
      toast({ title: "Generation deleted" });
    },
    onError: (error) =>
      toast({
        title: "Failed to delete",
        description: getApiErrorMessage(error),
        variant: "destructive",
      }),
  });
}
