import { Suspense } from "react";
import PickupCode from "@/components/PickupCode";

// S4 Pickup code + quick status buttons
export default function ReservationPage() {
  return (
    <Suspense>
      <PickupCode />
    </Suspense>
  );
}
