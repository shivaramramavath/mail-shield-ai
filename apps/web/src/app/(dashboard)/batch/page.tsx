
import type { Metadata } from "next";
import EmailWorkspace from "../_components/email-workspace";

export const metadata: Metadata = {
  title: "Batch Analysis",
};

export default function BatchPage() {
  return <EmailWorkspace mode="batch" />;
}
