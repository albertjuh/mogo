'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const Map = dynamic(
    () => import('@/components/map'),
    { 
        loading: () => <Skeleton className="h-full w-full rounded-lg" />,
        ssr: false
    }
);

export default function MapPage() {
    return (
        <div className="space-y-6 h-full flex flex-col">
             <header>
                <h1 className="text-3xl font-bold font-headline">Live Map</h1>
                <p className="text-muted-foreground">See your active riders' locations in real-time.</p>
            </header>
            <div className="flex-grow rounded-lg overflow-hidden border">
                <Map />
            </div>
        </div>
    )
}
