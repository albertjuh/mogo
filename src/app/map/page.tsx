'use client';

export default function MapPage() {
    return (
        <div className="space-y-6 h-full flex flex-col">
             <header>
                <h1 className="text-3xl font-bold font-headline">Live Map</h1>
                <p className="text-muted-foreground">This feature has been removed.</p>
            </header>
            <div className="flex-grow rounded-lg overflow-hidden border flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">Map functionality is not available.</p>
            </div>
        </div>
    )
}
