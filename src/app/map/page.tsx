'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { initialRiders } from '@/lib/data';
import type { Rider } from '@/lib/types';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/map'), {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full rounded-lg" />
});


export default function MapPage() {
    const [riders] = useLocalStorage<Rider[]>('riders', initialRiders);
    const activeRidersWithLocation = riders.filter(r => r.active && r.location);

    return (
        <div className="space-y-6 h-full flex flex-col">
             <header>
                <h1 className="text-3xl font-bold font-headline">Live Map</h1>
                <p className="text-muted-foreground">See your active riders' locations in real-time.</p>
            </header>
            <div className="flex-grow rounded-lg overflow-hidden border">
                <Map riders={activeRidersWithLocation}/>
            </div>
        </div>
    )
}
