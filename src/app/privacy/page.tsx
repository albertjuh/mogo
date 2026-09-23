import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — King Bariki",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12 prose prose-sm">
      <h1 className="text-3xl font-bold font-headline mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: 11 July 2026</p>

      <p>
        King Bariki ("we", "us") provides fleet, payment and loan management tools for
        bajaji (tuk-tuk) operators. This policy explains what data we collect
        through the app and how it is used.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li><strong>Account information:</strong> name, email address, and authentication data (via email/password or Google Sign-In).</li>
        <li><strong>Rider and vehicle records:</strong> phone number, plate number, chassis/engine numbers, guarantor and witness contact details, and identity references (e.g. Shahidi number) needed to manage contracts.</li>
        <li><strong>Financial records:</strong> payment amounts, payment references, loan balances and repayment history.</li>
        <li><strong>Location:</strong> approximate rider/vehicle location where provided, used to display fleet positions on the map.</li>
      </ul>

      <h2>How we use this information</h2>
      <p>
        We use the information above to operate the app: managing rider contracts, recording and
        verifying payments, generating alerts for missed payments or expiring contracts, and
        producing reports for fleet operators. We do not sell your personal information.
      </p>

      <h2>Data storage and security</h2>
      <p>
        Data is stored using Google Firebase (Firestore and Firebase Authentication). Access is
        restricted by role — riders can see their own records, and fleet administrators/supervisors
        can see records for the fleet they manage.
      </p>

      <h2>Data retention</h2>
      <p>
        Profile data is retained while your account is active. Payment records may be retained
        after account deletion where required for financial audit or legal record-keeping purposes.
      </p>

      <h2>Your rights</h2>
      <p>
        You can review your profile information from the <Link href="/account">Account</Link> page,
        and request deletion of your account and profile data at any time from that page.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy questions or data requests, contact <a href="mailto:berto.admin@bodaempire.com">berto.admin@bodaempire.com</a>.
      </p>
    </div>
  );
}
