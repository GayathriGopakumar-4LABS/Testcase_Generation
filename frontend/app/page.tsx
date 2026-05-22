import { redirect } from "next/navigation";

// Root route redirects — auth guard in the dashboard layout handles unauthenticated users
export default function HomePage() {
  redirect("/dashboard");
}
