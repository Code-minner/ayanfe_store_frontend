import type { Metadata } from "next";
import LegalPageShell from "@/components/legal/LegalPageShell";
import { STORE_HOURS, STORE_POLICY_SECTIONS } from "@/data/storePolicies";

export const metadata: Metadata = {
  title: "Terms & Store Policies | Ayanfe Store",
  description: "Opening hours, delivery, stockpile, and store policies for Ayanfe Store.",
};

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Terms & store policies"
      subtitle="Please read these rules before placing an order."
    >
      <p className="rounded-xl bg-[#F8F1FA] px-4 py-3 text-sm font-semibold text-[#4B0A6B]">
        {STORE_HOURS.summary}
      </p>

      {STORE_POLICY_SECTIONS.map((section) => (
        <section key={section.title}>
          <h2 className="text-base font-semibold text-neutral-900">{section.title}</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}

      <p className="text-xs text-neutral-500">
        By placing an order with Ayanfe Store, you agree to these terms and store policies.
      </p>
    </LegalPageShell>
  );
}
