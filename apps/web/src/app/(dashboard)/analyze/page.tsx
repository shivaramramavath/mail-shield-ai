
import type { Metadata } from "next";
import EmailWorkspace from "../_components/email-workspace";

export const metadata: Metadata = {
  title: "Analyze Email",
};

export default function AnalyzePage() {
  return <EmailWorkspace mode="analyze" />;
}
