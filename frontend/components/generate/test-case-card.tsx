"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn, PRIORITY_COLORS } from "@/lib/utils";
import type { TestCase } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  testCase: TestCase;
  index: number;
}

export function TestCaseCard({ testCase, index }: Props) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <Card
      className={cn(
        "transition-shadow",
        expanded ? "shadow-md" : "hover:shadow-sm"
      )}
    >
      <CardHeader
        className="cursor-pointer select-none py-4"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-7 min-w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-bold text-primary">
              {testCase.test_case_id ?? index + 1}
            </span>
            <div className="min-w-0">
              <span className="block truncate font-medium text-gray-900">{testCase.title}</span>
              {testCase.requirement_id && (
                <span className="text-xs text-muted-foreground">{testCase.requirement_id}</span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold",
                PRIORITY_COLORS[testCase.priority] ?? "bg-gray-100 text-gray-700"
              )}
            >
              {testCase.priority}
            </span>
            <Badge variant="outline" className="hidden sm:inline-flex">
              {testCase.test_type}
            </Badge>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4 border-t pt-4">
          {testCase.scenario && (
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Scenario
              </h4>
              <p className="text-sm text-gray-700">{testCase.scenario}</p>
            </div>
          )}

          {/* Preconditions */}
          <div>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Preconditions
            </h4>
            <p className="text-sm text-gray-700">{testCase.preconditions || "None"}</p>
          </div>

          {/* Steps */}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Steps
            </h4>
            <ol className="space-y-1.5">
              {testCase.steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {testCase.test_data && (
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Test Data
              </h4>
              <p className="text-sm text-gray-700">{testCase.test_data}</p>
            </div>
          )}

          {/* Expected result */}
          <div className="rounded-lg bg-green-50 p-3">
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-green-700">
              Expected Result
            </h4>
            <p className="text-sm text-green-800">{testCase.expected_result}</p>
          </div>

          {testCase.remarks && (
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Remarks
              </h4>
              <p className="text-sm text-gray-700">{testCase.remarks}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
