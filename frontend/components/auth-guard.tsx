"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const AUTH_PATHS = ["/login", "/register"];
const PUBLIC_PATHS = ["/"];

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

export function AuthGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loggedIn = isLoggedIn();
    const onAuthPage = AUTH_PATHS.includes(pathname);
    const onPublicPath = PUBLIC_PATHS.includes(pathname);

    if (onPublicPath) {
      router.replace(loggedIn ? "/dashboard" : "/login");
      return;
    }

    if (onAuthPage && loggedIn) {
      router.replace("/dashboard");
      return;
    }

    if (!onAuthPage && !loggedIn) {
      router.replace("/login");
    }
  }, [pathname, router]);

  return null;
}
