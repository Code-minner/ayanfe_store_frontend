import type { Metadata } from "next";
import Link from "next/link";
import LegalPageShell from "@/components/legal/LegalPageShell";
import { PAYMENT_POLICY_ITEMS } from "@/data/storePolicies";

export const metadata: Metadata = {
  title: "Payment Policy | Attog Store",
  description: "How payments, confirmation, and delivery fees work at Attog Store.",
};

export default function PaymentPolicyPage() {
  return (
    <LegalPageShell
      title="Payment policy"
      subtitle="How we take payment and when orders are confirmed."
    >
      <ul className="list-disc space-y-2 pl-5">
        {PAYMENT_POLICY_ITEMS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <p>
        For opening hours, delivery timelines, stockpile rules, and returns, see{" "}
        <Link href="/terms" className="font-medium text-[#4B0A6B] underline-offset-2 hover:underline">
          Terms & store policies
        </Link>
        .
      </p>
    </LegalPageShell>
  );
}
