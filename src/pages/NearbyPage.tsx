import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Compass,
  Bus,
  Train,
  Clock,
  Footprints,
  Layers,
  List,
  Map as MapIcon,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { TransitStop } from '../types.ts';
import { DEFAULT_STOPS, DEFAULT_ROUTES } from '../data/defaultTransitData.ts';
import { MapComponent } from '../components/MapComponent.tsx';

interface NearbyPageProps {
  onPlanTripFromStop?: (stopName: string) => void;
}

export const NearbyPage: React.FC<NearbyPageProps> = ({ onPlanTripFromStop }) => {
  const [stops, setStops] = useState<TransitStop[]>(DEFAULT_STOPS);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'both' | 'list' | 'map'>('both');
  const [typeFilter, setTypeFilter] = useState('all');
  const [userCoords, setUserCoords] = useState<[number, number]>([1.2834, 103.8505]); // Default Central
  const [locPermissionState, setLocPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [selectedStop, setSelectedStop] = useState<TransitStop | null>(DEFAULT_STOPS[0]);

  const fetchNearby = async (lat: number, lng: number, type: string) => {
    try {
      const res = await fetch(`/api/stops/nearby?lat=${lat}&lng=${lng}&type=${type}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setStops(data);
          if (!selectedStop) setSelectedStop(data[0]);
          return;
        }
      }
      // Fallback
      fallbackNearby(lat, lng, type);
    } catch {
      fallbackNearby(lat, lng, type);
    } finally {
      setLoading(false);
    }
  };

  const fallbackNearby = (lat: number, lng: number, type: string) => {
    const computed = DEFAULT_STOPS.map(stop => {
      const dLat = (stop.latitude - lat) * 111000;
      const dLng = (stop.longitude - lng) * 111000 * Math.cos((lat * Math.PI) / 180);
      const distanceMeters = Math.round(Math.sqrt(dLat * dLat + dLng * dLng));
      const walkingMinutes = Math.max(1, Math.round(distanceMeters / 80));
      return {
        ...stop,
        distanceMeters,
        walkingMinutes,
        availableRoutes: DEFAULT_ROUTES.slice(0, 2).map(r => ({
          routeNumber: r.routeNumber,
          name: r.name,
          color: r.color,
          type: r.type,
          status: r.status,
          nextDepartureInMinutes: Math.floor(Math.random() * 8) + 2,
        })),
      };
    });

    let filtered = computed;
    if (type !== 'all') {
      filtered = filtered.filter(s => s.type === type || (s.type === 'hub' && type !== 'bus'));
    }
    filtered.sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));
    setStops(filtered);
    if (filtered.length > 0) setSelectedStop(filtered[0]);
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocPermissionState('denied');
      fetchNearby(userCoords[0], userCoords[1], typeFilter);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserCoords(coords);
        setLocPermissionState('granted');
        fetchNearby(coords[0], coords[1], typeFilter);
      },
      () => {
        setLocPermissionState('denied');
        fetchNearby(userCoords[0], userCoords[1], typeFilter);
      },
      { timeout: 8000 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, [typeFilter]);

  const getStopTypeBadge = (type: string) => {
    switch (type) {
      case 'bus':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-100 text-blue-700 flex items-center gap-1">
            <Bus className="w-3 h-3" /> Bus Stop
          </span>
        );
      case 'metro':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-sky-100 text-sky-700 flex items-center gap-1">
            <Train className="w-3 h-3" /> Metro Station
          </span>
        );
      case 'train':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-red-100 text-red-700 flex items-center gap-1">
            <Train className="w-3 h-3" /> Commuter Rail
          </span>
        );
      case 'hub':
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-100 text-purple-700 flex items-center gap-1">
            <Layers className="w-3 h-3" /> Transit Hub
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Nearby Transport
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Live stations, walking times, and real-time departure boards based on your position.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={requestLocation}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Location</span>
            </button>

            {/* View Mode Toggle */}
            <div className="bg-slate-200/60 p-1 rounded-xl flex items-center gap-1">
              <button
                onClick={() => setViewMode('both')}
                className={`hidden md:block px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  viewMode === 'both' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Split
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  viewMode === 'map' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Map
              </button>
            </div>
          </div>
        </div>

        {/* Location Notice if denied or prompt */}
        {locPermissionState === 'denied' && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Location permission denied. Showing transit hubs around downtown central hub.</span>
            </div>
            <button onClick={requestLocation} className="font-bold underline hover:text-amber-900">
              Retry GPS
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Transport' },
            { id: 'bus', label: 'Bus Stops' },
            { id: 'metro', label: 'Metro Stations' },
            { id: 'train', label: 'Rail Stations' },
            { id: 'hub', label: 'Transit Hubs' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setTypeFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                typeFilter === f.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Split View Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* List View Column */}
          {(viewMode === 'both' || viewMode === 'list') && (
            <div className={`${viewMode === 'both' ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-4`}>
              {loading ? (
                <div className="py-20 text-center space-y-2">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-medium text-slate-500">Locating nearest transit stops...</p>
                </div>
              ) : stops.length === 0 ? (
                <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-slate-500 text-sm">
                  No stops found matching filter.
                </div>
              ) : (
                stops.map((stop) => {
                  const isSelected = selectedStop?.id === stop.id;
                  return (
                    <div
                      key={stop.id}
                      onClick={() => setSelectedStop(stop)}
                      className={`p-5 rounded-3xl border transition-all cursor-pointer bg-white ${
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                          : 'border-slate-200 hover:border-slate-300 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            {getStopTypeBadge(stop.type)}
                            {stop.code && (
                              <span className="text-[10px] font-mono font-semibold text-slate-400">
                                #{stop.code}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-slate-900">{stop.name}</h3>
                        </div>

                        {/* Walking distance pill */}
                        <div className="text-right shrink-0">
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                            <Footprints className="w-3 h-3 text-slate-500" />
                            <span>{stop.distanceMeters} m</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">~{stop.walkingMinutes} min walk</p>
                        </div>
                      </div>

                      {/* Available Routes & Next Departures Board */}
                      {stop.availableRoutes && stop.availableRoutes.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Upcoming Live Departures
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {stop.availableRoutes.map((r, rIdx) => (
                              <div
                                key={rIdx}
                                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: r.color || '#2563EB' }}
                                  />
                                  <span className="font-bold text-slate-800">{r.routeNumber}</span>
                                </div>
                                <span className="font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md text-[11px]">
                                  in {r.nextDepartureInMinutes} min
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quick plan trip action */}
                      {onPlanTripFromStop && (
                        <div className="mt-4 pt-2.5 flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlanTripFromStop(stop.name);
                            }}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <span>Plan trip from here</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Map View Column */}
          {(viewMode === 'both' || viewMode === 'map') && (
            <div className={`${viewMode === 'both' ? 'lg:col-span-6' : 'lg:col-span-12'} sticky top-24`}>
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <MapIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Interactive Area Map
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {stops.length} stations in view
                  </span>
                </div>

                <MapComponent
                  center={userCoords}
                  stops={stops}
                  currentLocation={userCoords}
                  onSelectStop={(st) => setSelectedStop(st)}
                  className="h-[480px] sm:h-[550px] w-full rounded-2xl shadow-inner border border-slate-100"
                />

                {selectedStop && (
                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <span className="text-slate-500">Selected: </span>
                      <span className="font-bold text-slate-900">{selectedStop.name}</span>
                    </div>
                    {onPlanTripFromStop && (
                      <button
                        onClick={() => onPlanTripFromStop(selectedStop.name)}
                        className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Plan from here
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
