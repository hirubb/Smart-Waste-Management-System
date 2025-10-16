import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RouteMap = ({ route, optimizedRoute }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        // Initialize map if not already initialized
        if (!mapInstanceRef.current && mapRef.current) {
            mapInstanceRef.current = L.map(mapRef.current).setView([7.2906, 80.6337], 13); // Default to Sri Lanka coordinates

            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(mapInstanceRef.current);
        }

        // Clear existing layers except base tile layer
        if (mapInstanceRef.current) {
            mapInstanceRef.current.eachLayer((layer) => {
                if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                    mapInstanceRef.current.removeLayer(layer);
                }
            });

            // Plot route if available
            if (route && route.collectionPoints) {
                plotRoute(route, 'blue', false);
            }

            // Plot optimized route if available
            if (optimizedRoute && optimizedRoute.collectionPoints) {
                plotRoute(optimizedRoute, 'green', true);
            }
        }

        // Cleanup on unmount
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [route, optimizedRoute]);

    const plotRoute = (routeData, color, isOptimized) => {
        const map = mapInstanceRef.current;
        if (!map) return;

        // Generate sample coordinates for collection points if not available
        // In production, these should come from your actual data
        const baseLatLng = [7.2906, 80.6337]; // Negombo coordinates
        const points = [];

        // Create collection points
        if (routeData.collectionPoints && typeof routeData.collectionPoints === 'number') {
            // If collectionPoints is just a count, generate sample locations
            for (let i = 0; i < Math.min(routeData.collectionPoints, 10); i++) {
                const lat = baseLatLng[0] + (Math.random() - 0.5) * 0.05;
                const lng = baseLatLng[1] + (Math.random() - 0.5) * 0.05;
                points.push([lat, lng]);
            }
        } else if (Array.isArray(routeData.collectionPoints)) {
            // If collection points have location data
            routeData.collectionPoints.forEach((point, index) => {
                if (point.location && point.location.latitude && point.location.longitude) {
                    points.push([point.location.latitude, point.location.longitude]);
                } else {
                    // Generate sample location if no coordinates
                    const lat = baseLatLng[0] + (Math.random() - 0.5) * 0.05;
                    const lng = baseLatLng[1] + (Math.random() - 0.5) * 0.05;
                    points.push([lat, lng]);
                }
            });
        }

        if (points.length === 0) {
            // Default to showing at least the base location
            points.push(baseLatLng);
        }

        // Create custom icon for markers
        const markerIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
        });

        // Add markers for collection points
        points.forEach((point, index) => {
            const marker = L.marker(point, { icon: markerIcon }).addTo(map);

            marker.bindPopup(`
        <div style="font-family: Arial, sans-serif;">
          <strong>${isOptimized ? 'Optimized' : 'Current'} Route</strong><br/>
          <strong>Point ${index + 1}</strong><br/>
          Route: ${routeData.name || routeData.routeName || 'Unknown'}<br/>
          Status: ${routeData.status || 'N/A'}
        </div>
      `);
        });

        // Draw polyline connecting the points
        if (points.length > 1) {
            L.polyline(points, {
                color: color,
                weight: isOptimized ? 4 : 3,
                opacity: 0.7,
                dashArray: isOptimized ? '10, 5' : null,
            }).addTo(map);
        }

        // Fit map to show all points
        if (points.length > 0) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '500px' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '8px' }} />

            {/* Legend */}
            {(route || optimizedRoute) && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    fontSize: '14px',
                }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Legend</div>
                    {route && (
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                            <div style={{
                                width: '20px',
                                height: '3px',
                                backgroundColor: 'blue',
                                marginRight: '8px',
                            }}></div>
                            <span>Current Route</span>
                        </div>
                    )}
                    {optimizedRoute && (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{
                                width: '20px',
                                height: '3px',
                                backgroundColor: 'green',
                                marginRight: '8px',
                                borderTop: '3px dashed green',
                            }}></div>
                            <span>Optimized Route</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RouteMap;