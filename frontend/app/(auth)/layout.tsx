"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical } from "lucide-react";

function isLoggedIn(): boolean {
  try {
    const raw = localStorage.getItem("qa-generator-auth");
    if (!raw) return false;
    const { state } = JSON.parse(raw);
    return !!state?.isAuthenticated;
  } catch {
    return false;
  }
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      router.replace("/dashboard");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg">
          <FlaskConical className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">QA Test Generator</h1>
        <p className="mt-1 text-sm text-muted-foreground">AI-powered test case generation platform</p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
