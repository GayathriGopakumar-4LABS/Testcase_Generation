"use client";

import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Overview of your test generation activity" },
  "/projects": { title: "Projects", subtitle: "Manage your test projects" },
  "/generate": { title: "Generate Test Cases", subtitle: "Describe your requirement and let AI do the work" },
  "/history": { title: "History", subtitle: "Browse all past test case generations" },
};

export function Header() {
  const pathname = usePathname();
  const match =
    Object.entries(PAGE_TITLES).find(([key]) => pathname === key || pathname.startsWith(key + "/"));
  const info = match?.[1] ?? { title: "QA Generator", subtitle: "" };

  return (
    <header className="border-b bg-white px-8 py-5">
      <h1 className="text-xl font-semibold text-gray-900">{info.title}</h1>
      {info.subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{info.subtitle}</p>}
    </header>
  );
}
