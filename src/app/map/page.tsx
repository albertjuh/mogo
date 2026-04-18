"use client";

import dynamic from 'next/dynamic';
import { useLocalStorage } from "@/hooks/use-local-storage";
import { initialRiders } from "@/lib/data";
import type { Rider } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from 'react';

export default function MapPage() {
    const [riders] = useLocalStorage<Rider[]>("riders", initialRiders);
    const ridersWithLocation = riders.filter(r => r.active && r.location);

    const Map = useMemo(() => dynamic(() => import('@/components/map'), { 
        ssr: false,
        loading: () => <Skeleton className="w-full h-full" />
    }), []);

    return (
        <div className="space-y-6 h-full flex flex-col">
             <header>
                <h1 className="text-3xl font-bold font-headline">Rider Location Preview</h1>
                <p className="text-muted-foreground">This map is for preview purposes only using sample data.</p>
            </header>
            <div className="flex-grow rounded-lg overflow-hidden border">
                <Map riders={ridersWithLocation} />
            </div>
        </div>
    )
}
