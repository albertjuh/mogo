'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { initialRiders } from '@/lib/data';
import type { Rider } from '@/lib/types';
import L from 'leaflet';

// This is a common fix for a known issue with Leaflet and webpack.
// It ensures that the default icon paths are resolved correctly.
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


export default function Map() {
    const [riders] = useLocalStorage<Rider[]>('riders', initialRiders);
    const activeRidersWithLocation = riders.filter(r => r.active && r.location);

    // Centered on Dar es Salaam, Tanzania
    const mapCenter: L.LatLngExpression = [-6.7924, 39.2083];

    return (
        <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
            <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {activeRidersWithLocation.map(rider => (
                <Marker key={rider.id} position={[rider.location!.lat, rider.location!.lng]}>
                    <Popup>
                        <div className="font-bold">{rider.name}</div>
                        <div>{rider.plateNumber}</div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    )
}
