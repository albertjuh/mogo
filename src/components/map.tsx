'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Rider } from '@/lib/types';
import L, { type Map as LeafletMap } from 'leaflet';
import { useRef, useEffect } from 'react';

// This is a common fix for a known issue with Leaflet and webpack.
// It ensures that the default icon paths are resolved correctly.
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapProps {
    riders: Rider[];
}

export default function Map({ riders }: MapProps) {
    const mapRef = useRef<LeafletMap | null>(null);
    // Centered on Dar es Salaam, Tanzania
    const mapCenter: L.LatLngExpression = [-6.7924, 39.2083];

    useEffect(() => {
        // On component unmount, this cleanup function will be called.
        // It ensures that the Leaflet map instance is properly destroyed,
        // which prevents the "Map container is already initialized" error
        // when React's StrictMode re-mounts the component in development.
        return () => {
          mapRef.current?.remove();
          mapRef.current = null;
        };
    }, []);

    return (
        <MapContainer
            ref={mapRef}
            center={mapCenter}
            zoom={12}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}>
            <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {riders.map(rider => (
                rider.location && (
                    <Marker key={rider.id} position={[rider.location.lat, rider.location.lng]}>
                        <Popup>
                            <div className="font-bold">{rider.name}</div>
                            <div>{rider.plateNumber}</div>
                        </Popup>
                    </Marker>
                )
            ))}
        </MapContainer>
    )
}
