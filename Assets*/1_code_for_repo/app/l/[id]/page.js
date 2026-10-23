import { Suspense } from "react";
import ListingDetail from "@/components/ListingDetail";
import { SkeletonList } from "@/components/States";

// S2 Listing detail. This file stays a Server Component so JC can add
// generateMetadata here for the Messenger/Viber preview card (J6):
//   export async function generateMetadata({ params }) { const { id } = await params; ... }
export default function ListingPage() {
  return (
    <Suspense fallback={<div className="p-4"><SkeletonList n={1} /></div>}>
      <ListingDetail />
    </Suspense>
  );
}
