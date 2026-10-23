"use client";

// Old vendor-only login URL: everyone logs in at /login now.
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OldVendorLogin() {
  const router = useRouter();
  useEffect(() => router.replace("/login?next=/vendor"), [router]);
  return null;
}
