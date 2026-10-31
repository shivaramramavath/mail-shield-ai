
import type { Metadata } from "next";
import EmailWorkspace from "../_components/email-workspace";

export const metadata: Metadata = {
  title: "Improve Email",
};

export default function ImprovePage() {
  return <EmailWorkspace mode="improve" />;
}
