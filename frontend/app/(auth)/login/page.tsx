import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign In — QA Test Generator" };

export default function LoginPage() {
  return <LoginForm />;
}
