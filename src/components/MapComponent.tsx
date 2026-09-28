import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { JourneyStep, TransitStop } from '../types.ts';

interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  stops?: TransitStop[];
  selectedRouteSteps?: JourneyStep[];
  allCoordinates?: [number, number][];
  currentLocation?: [number, number] | null;
  originName?: string;
  destinationName?: string;
  onSelectStop?: (stop: TransitStop) => void;
  className?: string;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  center = [1.2834, 103.8505], // Singapore downtown transit center
  zoom = 13,
  stops = [],
  selectedRouteSteps = [],
  allCoordinates = [],
  currentLocation = null,
  originName,
  destinationName,
  onSelectStop,
  className = 'h-96 w-full rounded-2xl overflow-hidden shadow-sm',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
        attributionControl: false,
      });

      // Standard crisp OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Attribution small at bottom right
      L.control.attribution({ position: 'bottomright' })
        .addAttribution('TransitMate Maps')
        .addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Layers when data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    const bounds: [number, number][] = [];

    // Helper to generate custom SVG HTML icon
    const createHtmlMarker = (bgClass: string, symbol: string, title: string) => {
      return L.divIcon({
        className: 'custom-transit-marker',
        html: `
          <div style="background-color: ${bgClass}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 13px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2px solid white;" title="${title}">
            ${symbol}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });
    };

    // Render User Current Location
    if (currentLocation) {
      bounds.push(currentLocation);
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="position: relative; width: 20px; height: 20px;">
            <div style="position: absolute; width: 20px; height: 20px; background-color: #3B82F6; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59,130,246,0.6);"></div>
            <div style="position: absolute; -webkit-animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; width: 20px; height: 20px; border-radius: 50%; background-color: rgba(59,130,246,0.4);"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker(currentLocation, { icon: userIcon })
        .bindPopup('<strong>You are here</strong><br/>Current GPS location')
        .addTo(layerGroup);
    }

    // Render Transit Stops if provided
    stops.forEach((stop) => {
      bounds.push([stop.latitude, stop.longitude]);
      let color = '#2563EB'; // Blue for bus
      let symbol = '🚌';
      if (stop.type === 'metro') {
        color = '#0284C7';
        symbol = '🚇';
      } else if (stop.type === 'train') {
        color = '#DC2626';
        symbol = '🚆';
      } else if (stop.type === 'hub') {
        color = '#7C3AED';
        symbol = '🏛️';
      }

      const marker = L.marker([stop.latitude, stop.longitude], {
        icon: createHtmlMarker(color, symbol, stop.name),
      });

      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 160px; padding: 4px;">
          <h4 style="margin: 0 0 4px; font-weight: bold; font-size: 14px; color: #0F172A;">${stop.name}</h4>
          <span style="display: inline-block; padding: 2px 6px; font-size: 11px; font-weight: 600; border-radius: 4px; background: #EEF2F6; color: #334155; margin-bottom: 6px; text-transform: uppercase;">
            ${stop.type}
          </span>
          ${stop.accessible ? '<p style="margin: 0; font-size: 12px; color: #16A34A;">♿ Step-free access</p>' : ''}
          ${stop.distanceMeters ? `<p style="margin: 2px 0 0; font-size: 12px; color: #64748B;">~${stop.distanceMeters}m (${stop.walkingMinutes} min walk)</p>` : ''}
        </div>
      `);

      if (onSelectStop) {
        marker.on('click', () => onSelectStop(stop));
      }

      marker.addTo(layerGroup);
    });

    // Render Active Journey Route Polylines
    if (selectedRouteSteps && selectedRouteSteps.length > 0) {
      selectedRouteSteps.forEach((step) => {
        if (!step.coordinates || step.coordinates.length < 2) return;

        step.coordinates.forEach(c => bounds.push(c));

        const isWalk = step.type === 'walk' || step.type === 'transfer';
        const strokeColor = isWalk ? '#64748B' : (step.routeColor || '#2563EB');
        const dashArray = isWalk ? '6, 8' : undefined;
        const weight = isWalk ? 4 : 6;

        const polyline = L.polyline(step.coordinates, {
          color: strokeColor,
          weight,
          opacity: 0.85,
          dashArray,
          lineJoin: 'round',
          lineCap: 'round',
        });

        polyline.bindPopup(`
          <div style="font-family: sans-serif;">
            <p style="margin: 0; font-weight: bold; color: ${strokeColor}; font-size: 13px;">${step.instruction}</p>
            <p style="margin: 2px 0 0; font-size: 12px; color: #475569;">${step.detail} (${step.durationMinutes} min)</p>
          </div>
        `);

        polyline.addTo(layerGroup);
      });

      // Add Start Marker
      const firstCoord = selectedRouteSteps[0]?.coordinates?.[0];
      if (firstCoord) {
        const startIcon = L.divIcon({
          className: 'start-marker',
          html: `<div style="background-color: #16A34A; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">A</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });
        L.marker(firstCoord, { icon: startIcon })
          .bindPopup(`<strong>Origin:</strong> ${originName || 'Starting Point'}`)
          .addTo(layerGroup);
      }

      // Add Destination Marker
      const lastStep = selectedRouteSteps[selectedRouteSteps.length - 1];
      const lastCoord = lastStep?.coordinates?.[lastStep.coordinates.length - 1];
      if (lastCoord) {
        const endIcon = L.divIcon({
          className: 'end-marker',
          html: `<div style="background-color: #DC2626; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">B</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });
        L.marker(lastCoord, { icon: endIcon })
          .bindPopup(`<strong>Destination:</strong> ${destinationName || 'Destination Point'}`)
          .addTo(layerGroup);
      }
    } else if (allCoordinates.length > 0) {
      allCoordinates.forEach(c => bounds.push(c));
    }

    // Auto-fit bounds if we have points
    if (bounds.length > 1) {
      try {
        map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 15 });
      } catch (err) {
        console.warn('Could not fit map bounds:', err);
      }
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 14);
    }
  }, [stops, selectedRouteSteps, allCoordinates, currentLocation, originName, destinationName, onSelectStop]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
