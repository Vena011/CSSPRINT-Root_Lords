import { Suspense } from "react";
import VendorDashboard from "@/components/VendorDashboard";

// V2 Vendor dashboard: alert card, my listings, results card, Post button
export default function VendorPage() {
  return (
    <Suspense>
      <VendorDashboard />
    </Suspense>
  );
}
