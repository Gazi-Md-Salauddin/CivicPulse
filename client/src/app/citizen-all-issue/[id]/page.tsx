import { Suspense } from "react";
import IssueDetailsPage from "@/components/homepage/IssueDetails";

export default function DetailsPage() {
  return (
    <Suspense fallback={<div>Loading issue details...</div>}>
      <IssueDetailsPage />
    </Suspense>
  );
}