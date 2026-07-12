import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Boda Empire",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12 prose prose-sm">
      <h1 className="text-3xl font-bold font-headline mb-2">Terms of Service</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: 11 July 2026</p>

      <p>
        By creating an account or using Boda Empire, you agree to these terms.
      </p>

      <h2>Use of the app</h2>
      <p>
        Boda Empire is a fleet, payment and loan tracking tool. Records entered into the app
        (contracts, payments, loan balances) are for operational management and do not by
        themselves constitute a separate legal agreement between riders and the fleet operator —
        the underlying written contract (Mkataba) governs that relationship.
      </p>

      <h2>Accounts</h2>
      <p>
        You are responsible for keeping your login credentials secure. Fleet administrators are
        responsible for assigning and revoking staff access (supervisor/recruiter roles) for their
        organization.
      </p>

      <h2>Accuracy of records</h2>
      <p>
        Payment and contract data is entered by fleet staff or generated from device input. While
        we aim to keep records accurate, Boda Empire is a management tool, not a payment processor,
        and does not itself move funds between parties.
      </p>

      <h2>Account deletion</h2>
      <p>
        You may delete your account at any time from the <Link href="/account">Account</Link> page.
        Some payment records may be retained after deletion for financial audit or legal
        record-keeping purposes, as described in our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms as the app evolves. Continued use of the app after changes are
        posted constitutes acceptance of the updated terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms can be sent to <a href="mailto:berto.admin@bodaempire.com">berto.admin@bodaempire.com</a>.
      </p>
    </div>
  );
}
