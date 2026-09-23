"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useLanguage } from "@/lib/i18n/language-context";

export default function PrivacyPage() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = "Privacy Policy — King Bariki";
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 prose prose-sm">
      <h1 className="text-3xl font-bold font-headline mb-2">{t("legal.privacy.title")}</h1>
      <p className="text-muted-foreground text-sm mb-8">{t("legal.lastUpdated")}</p>

      <p>
        {t("legal.privacy.intro")}
      </p>

      <h2>{t("legal.privacy.collect.heading")}</h2>
      <ul>
        <li><strong>{t("legal.privacy.collect.account.label")}</strong> {t("legal.privacy.collect.account.body")}</li>
        <li><strong>{t("legal.privacy.collect.rider.label")}</strong> {t("legal.privacy.collect.rider.body")}</li>
        <li><strong>{t("legal.privacy.collect.financial.label")}</strong> {t("legal.privacy.collect.financial.body")}</li>
        <li><strong>{t("legal.privacy.collect.location.label")}</strong> {t("legal.privacy.collect.location.body")}</li>
      </ul>

      <h2>{t("legal.privacy.use.heading")}</h2>
      <p>
        {t("legal.privacy.use.body")}
      </p>

      <h2>{t("legal.privacy.storage.heading")}</h2>
      <p>
        {t("legal.privacy.storage.body")}
      </p>

      <h2>{t("legal.privacy.retention.heading")}</h2>
      <p>
        {t("legal.privacy.retention.body")}
      </p>

      <h2>{t("legal.privacy.rights.heading")}</h2>
      <p>
        {t("legal.privacy.rights.body1")} <Link href="/account">{t("nav.account")}</Link>{" "}
        {t("legal.privacy.rights.body2")}
      </p>

      <h2>{t("legal.privacy.contact.heading")}</h2>
      <p>
        {t("legal.privacy.contact.body")} <a href="mailto:berto.admin@bodaempire.com">berto.admin@bodaempire.com</a>.
      </p>
    </div>
  );
}
