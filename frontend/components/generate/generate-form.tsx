"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Sparkles, Upload, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useProjects } from "@/hooks/use-projects";
import { useCreateGeneration } from "@/hooks/use-generations";
import { TEST_TYPES } from "@/lib/utils";
import type { Generation } from "@/types";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  project_id: z.string().min(1, "Select a project"),
  test_type: z.string().min(1, "Select a test type"),
  requirement: z.string().min(20, "Requirement must be at least 20 characters"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  initialValues?: Partial<FormData>;
  onResult: (gen: Generation) => void;
  onValuesChange?: (values: Partial<FormData>) => void;
}

async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "txt" || ext === "md") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string ?? "");
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }

  if (ext === "pdf") {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const pages = await Promise.all(
      Array.from({ length: pdf.numPages }, (_, i) =>
        pdf.getPage(i + 1).then((p) => p.getTextContent()).then((c) =>
          c.items.map((item) => ("str" in item ? item.str : "")).join(" ")
        )
      )
    );
    return pages.join("\n\n");
  }

  if (ext === "docx") {
    const mammoth = await import("mammoth");
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value;
  }

  throw new Error("Unsupported file type. Please upload a .txt, .md, .pdf, or .docx file.");
}

export function GenerateForm({ initialValues, onResult, onValuesChange }: Props) {
  const searchParams = useSearchParams();
  const preselectedProject = searchParams.get("project");
  const didApplyInitialValues = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);

  const { data: projects = [] } = useProjects();
  const createGen = useCreateGeneration();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { test_type: "Functional" },
  });

  useEffect(() => {
    if (
      !didApplyInitialValues.current &&
      initialValues &&
      Object.keys(initialValues).length > 0
    ) {
      reset({ test_type: "Functional", ...initialValues });
      didApplyInitialValues.current = true;
    }
  }, [initialValues, reset]);

  useEffect(() => {
    if (preselectedProject) setValue("project_id", preselectedProject);
  }, [preselectedProject, setValue]);

  useEffect(() => {
    const subscription = watch((values) => onValuesChange?.(values));
    return () => subscription.unsubscribe();
  }, [onValuesChange, watch]);

  const onSubmit = async (data: FormData) => {
    try {
      const result = await createGen.mutateAsync(data);
      onResult(result);
    } catch {
      // The mutation's onError handler shows the toast. Prevent the rejected
      // promise from bubbling into Next's runtime error overlay.
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError(null);
    setIsParsingFile(true);
    try {
      const text = await extractTextFromFile(file);
      setValue("requirement", text, { shouldValidate: true });
      setUploadedFileName(file.name);
    } catch (err) {
      setFileError(err instanceof Error ? err.message : "Failed to read file");
    } finally {
      setIsParsingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const clearUploadedFile = () => {
    setUploadedFileName(null);
    setFileError(null);
    setValue("requirement", "", { shouldValidate: false });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Test Case Generator
        </CardTitle>
        <CardDescription>
          Describe your requirement in plain English — Gemini will generate structured test cases.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Generation title</Label>
            <Input id="title" placeholder="e.g. User login — happy path & edge cases" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* Project + Test type — side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project</Label>
              <Controller
                name="project_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project…" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.project_id && (
                <p className="text-xs text-destructive">{errors.project_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Test type</Label>
              <Controller
                name="test_type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type…" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEST_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.test_type && (
                <p className="text-xs text-destructive">{errors.test_type.message}</p>
              )}
            </div>
          </div>

          {/* Requirement */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="requirement">Requirement</Label>
              <div className="flex items-center gap-2">
                {uploadedFileName && (
                  <span className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {uploadedFileName}
                    <button
                      type="button"
                      onClick={clearUploadedFile}
                      className="ml-0.5 hover:text-destructive"
                      aria-label="Remove uploaded file"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.pdf,.docx"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 text-xs"
                  disabled={isParsingFile}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isParsingFile ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Upload className="h-3 w-3" />
                  )}
                  {isParsingFile ? "Reading…" : "Upload file"}
                </Button>
              </div>
            </div>
            <Textarea
              id="requirement"
              placeholder="Describe the feature or functionality you want test cases for. Be as specific as possible — include user roles, expected behaviors, edge cases you're aware of, and any constraints…"
              rows={8}
              className="resize-y"
              {...register("requirement")}
            />
            {fileError && <p className="text-xs text-destructive">{fileError}</p>}
            {errors.requirement && (
              <p className="text-xs text-destructive">{errors.requirement.message}</p>
            )}
            <p className="text-xs text-muted-foreground">Supports .txt, .md, .pdf, .docx</p>
          </div>

          <Button type="submit" size="lg" className="w-full gap-2" disabled={createGen.isPending}>
            {createGen.isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Generating test cases…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate test cases
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
