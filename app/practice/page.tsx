import { Suspense } from "react";
import { PracticeSession } from "@/components/practice/PracticeSession";
export default function Page() {
  return (
    <Suspense
      fallback={<div className="loading">Preparing your practice…</div>}
    >
      <PracticeSession />
    </Suspense>
  );
}
