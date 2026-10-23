import { Suspense } from "react";
import ChatThread from "@/components/ChatThread";

// One order's chat between the student and the vendor.
export default function ThreadPage() {
  return (
    <Suspense>
      <ChatThread />
    </Suspense>
  );
}
