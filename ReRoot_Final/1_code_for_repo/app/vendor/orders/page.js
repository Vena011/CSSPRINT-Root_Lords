import { Suspense } from "react";
import VendorOrders from "@/components/VendorOrders";

// V4 Orders grouped by dorm + Share buttons per dorm
export default function OrdersPage() {
  return (
    <Suspense>
      <VendorOrders />
    </Suspense>
  );
}
