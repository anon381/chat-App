"use client";

/*
  Page: Auth (Sign in / Sign up)
  Purpose: Entry screen to authenticate users. Toggles between login and registration, calls /api/auth/login or /api/auth/register,
  stores the returned JWT in localStorage, shows notifications, then redirects to /chat on success.
  UI: Compact card with small inputs and gradient background. Uses AnimatedInput, InteractiveButton, and Notification components.
  Client-only: Uses useState and useRouter; no server components.
*/

import { AuthUI } from "@/components/ui/auth-fuse";

export default function Home() {
  return <AuthUI />;
}
