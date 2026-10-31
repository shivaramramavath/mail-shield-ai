
import type { Metadata } from "next";
import EmailWorkspace from "../_components/email-workspace";

export const metadata: Metadata = {
  title: "Email Security",
};

export default function SecurityPage() {
  return <EmailWorkspace mode="security" />;
}
