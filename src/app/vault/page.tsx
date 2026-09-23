"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { initialDocuments } from "@/lib/data";
import type { Document } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, ExternalLink, ShieldCheck } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useLanguage } from "@/lib/i18n/language-context";

export default function VaultPage() {
  const { t } = useLanguage();
  const [documents] = useLocalStorage<Document[]>("documents", initialDocuments);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black font-headline">{t("vault.title")}</h1>
        <p className="text-muted-foreground">{t("vault.subtitle")}</p>
      </header>

      <div className="space-y-4">
        {documents.map((doc) => (
          <Card key={doc.id} className="border-none shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
                <div className="flex items-center p-4 gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl">
                        <FileText className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold truncate">{doc.documentName}</h3>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">
                            {doc.documentType} • {format(parseISO(doc.uploadDate), "dd MMM yyyy")}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 bg-secondary rounded-lg hover:bg-primary hover:text-white transition-colors">
                            <Download size={20} />
                        </button>
                         <button className="p-2 bg-secondary rounded-lg hover:bg-primary hover:text-white transition-colors">
                            <ExternalLink size={20} />
                        </button>
                    </div>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-accent text-accent-foreground border-none">
        <CardContent className="p-6 flex gap-4 items-center">
            <ShieldCheck className="h-10 w-10 text-primary shrink-0" />
            <div>
                <h4 className="font-bold">{t("vault.offline.title")}</h4>
                <p className="text-xs opacity-80">{t("vault.offline.description")}</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
