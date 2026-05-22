"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Generation } from "@/types";
import { GenerateForm } from "@/components/generate/generate-form";
import { ResultsPanel } from "@/components/generate/results-panel";
import { Skeleton } from "@/components/ui/skeleton";

const GENERATE_SESSION_KEY = "qa-generator-generate-session";

type GenerateFormValues = {
  title: string;
  project_id: string;
  test_type: string;
  requirement: string;
};

type GenerateSession = {
  form?: Partial<GenerateFormValues>;
  result?: Generation;
};

function readGenerateSession(): GenerateSession {
  if (typeof window === "undefined") return {};

  try {
    const raw = sessionStorage.getItem(GENERATE_SESSION_KEY);
    return raw ? (JSON.parse(raw) as GenerateSession) : {};
  } catch {
    return {};
  }
}

function writeGenerateSession(session: GenerateSession) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(GENERATE_SESSION_KEY, JSON.stringify(session));
}

function GeneratePageInner() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project") ?? undefined;
  const [session, setSession] = useState<GenerateSession>({});

  useEffect(() => {
    setSession(readGenerateSession());
  }, []);

  const formValues = useMemo(
    () => ({
      ...session.form,
      ...(projectId ? { project_id: projectId } : {}),
    }),
    [projectId, session.form]
  );

  const handleValuesChange = useCallback((values: Partial<GenerateFormValues>) => {
    setSession((current) => {
      if (JSON.stringify(current.form ?? {}) === JSON.stringify(values)) {
        return current;
      }

      const next = { ...current, form: values };
      writeGenerateSession(next);
      return next;
    });
  }, []);

  const handleResult = useCallback((generation: Generation) => {
    setSession(() => {
      const next = {
        form: {
          title: generation.title,
          project_id: generation.project_id,
          test_type: generation.test_type,
          requirement: generation.requirement,
        },
        result: generation,
      };
      writeGenerateSession(next);
      return next;
    });
  }, []);

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
      {/* Left - input form */}
      <div>
        <GenerateForm
          initialValues={formValues}
          onValuesChange={handleValuesChange}
          onResult={handleResult}
        />
      </div>

      {/* Right - results */}
      <div>
        {session.result ? (
          <ResultsPanel generation={session.result} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed bg-white p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <svg
                className="h-8 w-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Results will appear here</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Fill in the form and click &ldquo;Generate test cases&rdquo; to see AI-generated test cases.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <Skeleton className="h-[560px] rounded-xl" />
          <Skeleton className="h-[560px] rounded-xl" />
        </div>
      }
    >
      <GeneratePageInner />
    </Suspense>
  );
}
