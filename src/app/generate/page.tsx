import type { Metadata } from "next";
import { GenerateFlow } from "@/components/workspace/GenerateFlow";

export const metadata: Metadata = {
  title: "Generate",
  alternates: { canonical: "/generate/" },
};

export default function GeneratePage() {
  return (
    <div className="workspace wrap">
      <GenerateFlow />
    </div>
  );
}
