"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { Rider } from '@/lib/types';

// Dynamically import the actual map component
const Map = dynamic(
    () => import('@/components/map'),
    {
        ssr: false,
        loading: () => <Skeleton className="h-full w-full rounded-lg" />
    }
);

interface DynamicMapProps {
    riders: Rider[];
}

// This wrapper component will be imported by the page
export default function DynamicMap({ riders }: DynamicMapProps) {
    return <Map riders={riders} />;
}
