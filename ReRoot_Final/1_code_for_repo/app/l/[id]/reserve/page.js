import { Suspense } from "react";
import ReserveForm from "@/components/ReserveForm";

// S3 Reserve form
export default function ReservePage() {
  return (
    <Suspense>
      <ReserveForm />
    </Suspense>
  );
}
