"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useLanguage } from "@/lib/i18n/language-context";

export default function TermsPage() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = "Terms of Service — King Bariki";
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 prose prose-sm">
      <h1 className="text-3xl font-bold font-headline mb-2">{t("legal.terms.title")}</h1>
      <p className="text-muted-foreground text-sm mb-8">{t("legal.lastUpdated")}</p>

      <p>
        {t("legal.terms.intro")}
      </p>

      <h2>{t("legal.terms.useOfApp.heading")}</h2>
      <p>
        {t("legal.terms.useOfApp.body")}
      </p>

      <h2>{t("legal.terms.accounts.heading")}</h2>
      <p>
        {t("legal.terms.accounts.body")}
      </p>

      <h2>{t("legal.terms.accuracy.heading")}</h2>
      <p>
        {t("legal.terms.accuracy.body")}
      </p>

      <h2>{t("legal.terms.deletion.heading")}</h2>
      <p>
        {t("legal.terms.deletion.body1")} <Link href="/account">{t("nav.account")}</Link>{" "}
        {t("legal.terms.deletion.body2")} <Link href="/privacy">{t("account.legal.privacy")}</Link>.
      </p>

      <h2>{t("legal.terms.changes.heading")}</h2>
      <p>
        {t("legal.terms.changes.body")}
      </p>

      <h2>{t("legal.terms.contact.heading")}</h2>
      <p>
        {t("legal.terms.contact.body")} <a href="mailto:berto.admin@bodaempire.com">berto.admin@bodaempire.com</a>.
      </p>
    </div>
  );
}
