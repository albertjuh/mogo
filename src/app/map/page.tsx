"use client";

import dynamic from 'next/dynamic';
import { useUser } from "@/supabase/auth/use-user";
import { useTable, type TableQuery } from "@/supabase/use-table";
import { riderFromRow, type RiderRow } from "@/supabase/mappers";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from 'react';
import { useLanguage } from "@/lib/i18n/language-context";

export default function MapPage() {
    const { t } = useLanguage();
    const { user } = useUser();
    const isManager = user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'recruiter';

    const ridersQuery: TableQuery | null = user && isManager ? { table: "riders" } : null;
    const { data: riders, isLoading } = useTable<RiderRow, ReturnType<typeof riderFromRow>>(ridersQuery, riderFromRow);

    const ridersWithLocation = (riders || []).filter(r => r.active && r.location);

    const Map = useMemo(() => dynamic(() => import('@/components/map'), {
        ssr: false,
        loading: () => <Skeleton className="w-full h-full" />
    }), []);

    if (!isManager) {
        return <div className="p-12 text-center text-muted-foreground font-bold">{t("map.unauthorized")}</div>;
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
             <header>
                <h1 className="text-3xl font-bold font-headline">{t("map.title")}</h1>
                <p className="text-muted-foreground">
                    {ridersWithLocation.length > 0
                        ? t("map.description.live")
                        : t("map.description.noGps")}
                </p>
            </header>
            <div className="flex-grow rounded-lg overflow-hidden border">
                {isLoading ? <Skeleton className="w-full h-full" /> : <Map riders={ridersWithLocation} />}
            </div>
        </div>
    )
}
