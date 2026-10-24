import type { Metadata } from "next";
import Link from "next/link";
import LegalPageShell from "@/components/legal/LegalPageShell";
import { STORE_CONTACT } from "@/data/contact";

export const metadata: Metadata = {
  title: "Privacy Policy | Ayanfe Store",
  description: "How Ayanfe Store uses your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      title="Privacy policy"
      subtitle="How we collect and use your information."
    >
      <section>
        <h2 className="text-base font-semibold text-neutral-900">What we collect</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Name, email, phone, and delivery details you provide at checkout.</li>
          <li>Order history and payment status for orders you place with us.</li>
          <li>Account details if you create a customer account.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-semibold text-neutral-900">How we use it</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>To process and confirm your orders.</li>
          <li>To contact you about payment, pickup, delivery, or support.</li>
          <li>To improve our store and prevent fraud.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-semibold text-neutral-900">Sharing</h2>
        <p className="mt-3">
          We share only what is needed with payment providers (such as Paystack), delivery
          partners, and tools that help us run the store. We do not sell your personal data.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-neutral-900">Contact</h2>
        <p className="mt-3">
          Questions about privacy? Email{" "}
          <a
            href={`mailto:${STORE_CONTACT.emails[0]}`}
            className="font-medium text-[#4B0A6B] underline-offset-2 hover:underline"
          >
            {STORE_CONTACT.emails[0]}
          </a>{" "}
          or see our{" "}
          <Link href="/contact" className="font-medium text-[#4B0A6B] underline-offset-2 hover:underline">
            contact page
          </Link>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}
