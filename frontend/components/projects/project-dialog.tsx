"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import type { Project } from "@/types";
import { useCreateProject, useUpdateProject } from "@/hooks/use-projects";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  description: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
  mode: "create" | "edit";
}

export function ProjectDialog({ open, onOpenChange, project, mode }: Props) {
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const isLoading = createProject.isPending || updateProject.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: project?.name ?? "", description: project?.description ?? "" },
  });

  useEffect(() => {
    if (open) reset({ name: project?.name ?? "", description: project?.description ?? "" });
  }, [open, project, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (mode === "create") {
        await createProject.mutateAsync(data);
      } else if (project) {
        await updateProject.mutateAsync({ id: project.id, data });
      }
      onOpenChange(false);
    } catch {
      // Mutation hooks show the toast. Keep handled API failures out of
      // Next's runtime error overlay.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New project" : "Edit project"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Projects group your test case generations together."
              : "Update your project details."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project name</Label>
            <Input id="name" placeholder="e.g. E-commerce Checkout Flow" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Brief description of what this project covers…"
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin" />}
              {mode === "create" ? "Create project" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
