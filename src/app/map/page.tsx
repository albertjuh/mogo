'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { initialRiders } from '@/lib/data';
import type { Rider } from '@/lib/types';


export default function MapPage() {
    const Map = useMemo(() => dynamic(
        () => import('@/components/map'),
        { 
            loading: () => <Skeleton className="h-full w-full rounded-lg" />,
            ssr: false 
        }
    ), []);
    
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
