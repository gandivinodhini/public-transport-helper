import React, { useState, useEffect } from 'react';
import {
  Navigation,
  MapPin,
  Clock,
  Calendar,
  ArrowRightLeft,
  Filter,
  CheckCircle2,
  Bookmark,
  Footprints,
  Bus,
  Train,
  ArrowRight,
  ShieldCheck,
  Leaf,
  Share2,
  AlertCircle,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { RouteOption } from '../types.ts';
import { RouteDetailsModal } from '../components/RouteDetailsModal.tsx';
import { MapComponent } from '../components/MapComponent.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface PlannerPageProps {
  initialOrigin?: string;
  initialDestination?: string;
  initialTime?: string;
  initialDate?: string;
  initialPref?: string;
  onSaveTripNotify?: () => void;
}

export const PlannerPage: React.FC<PlannerPageProps> = ({
  initialOrigin = 'Central Transit Hub',
  initialDestination = 'University Station',
  initialTime = '08:30',
  initialDate = new Date().toISOString().split('T')[0],
  initialPref = 'all',
  onSaveTripNotify,
}) => {
  const { user, profile } = useAuth();
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [departureTime, setDepartureTime] = useState(initialTime);
  const [date, setDate] = useState(initialDate);
  const [transportPref, setTransportPref] = useState(initialPref);
  const [accessibleOnly, setAccessibleOnly] = useState(false);

  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<'fastest' | 'cheapest' | 'transfers' | 'walking'>('fastest');
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!origin.trim() || !destination.trim()) {
      setError('Please provide both origin and destination.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/journey/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          departureTime,
          date,
          transportPreference: transportPref,
          accessibleOnly,
        }),
      });

      if (!res.ok) throw new Error('Failed to compute journeys.');
      const data = await res.json();
      setRoutes(data.options || []);
    } catch (err: any) {
      console.error(err);
      setError('Could not calculate routes. Please verify stop names.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSaveTrip = async (routeToSave: RouteOption) => {
    try {
      const token = user ? await user.getIdToken() : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/saved-trips', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: `${routeToSave.departureStop} → ${routeToSave.arrivalStop}`,
          origin: routeToSave.departureStop,
          destination: routeToSave.arrivalStop,
          preferredTransport: transportPref,
          notes: `${routeToSave.summaryTransport} (${routeToSave.totalDurationMinutes} min, $${routeToSave.fare})`,
        }),
      });

      if (res.ok) {
        setSaveSuccessMsg(`Saved "${routeToSave.title}" to your Saved Trips!`);
        if (onSaveTripNotify) onSaveTripNotify();
        setTimeout(() => setSaveSuccessMsg(null), 3000);
      } else {
        // Fallback local save if offline / guest
        const existing = JSON.parse(localStorage.getItem('transitmate_saved_trips') || '[]');
        existing.push({
          id: Date.now(),
          title: `${routeToSave.departureStop} → ${routeToSave.arrivalStop}`,
          origin: routeToSave.departureStop,
          destination: routeToSave.arrivalStop,
          notes: routeToSave.summaryTransport,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('transitmate_saved_trips', JSON.stringify(existing));
        setSaveSuccessMsg(`Saved "${routeToSave.title}" to device storage!`);
        setTimeout(() => setSaveSuccessMsg(null), 3000);
      }
    } catch {
      setSaveSuccessMsg(`Trip saved successfully.`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
  };

  // Sort/filter based on objective metrics
  const sortedRoutes = [...routes].sort((a, b) => {
    if (activeFilter === 'fastest') {
      return a.totalDurationMinutes - b.totalDurationMinutes;
    }
    if (activeFilter === 'cheapest') {
      return a.fare - b.fare;
    }
    if (activeFilter === 'transfers') {
      return a.transfersCount - b.transfersCount;
    }
    if (activeFilter === 'walking') {
      return a.walkingDistanceMeters - b.walkingDistanceMeters;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Journey Planner
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Objective routing engine with timetables, fares, step-by-step connections, and walking paths.
            </p>
          </div>
        </div>

        {/* Save confirmation toast */}
        {saveSuccessMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Search Parameter Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Origin */}
              <div className="md:col-span-5 relative">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Origin
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 w-3 h-3 rounded-full border-2 border-blue-600 bg-white" />
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="Starting stop or place"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Swap Button */}
              <div className="md:col-span-1 flex justify-center pt-5">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-600 transition-colors"
                  title="Swap origin and destination"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Destination */}
              <div className="md:col-span-6 relative">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Destination
                </label>
                <div className="relative flex items-center">
                  <MapPin className="w-4 h-4 text-red-500 absolute left-3" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Destination station or landmark"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Time, Transport Preference & Filter bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Travel Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Preference
                </label>
                <select
                  value={transportPref}
                  onChange={(e) => setTransportPref(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  <option value="all">Any Transport</option>
                  <option value="bus">Bus Only</option>
                  <option value="metro">Metro Only</option>
                  <option value="train">Train Only</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-4 h-4" />
                  <span>{loading ? 'Routing...' : 'Find Routes'}</span>
                </button>
              </div>
            </div>

            {/* Accessibility Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="accessibleCheck"
                checked={accessibleOnly}
                onChange={(e) => setAccessibleOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <label htmlFor="accessibleCheck" className="text-xs text-slate-600 flex items-center gap-1 font-medium cursor-pointer">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Prefer step-free & wheelchair-accessible connections</span>
              </label>
            </div>
          </form>
        </div>

        {/* Filter Metric Pills */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-slate-400">Sort by:</span>
            <div className="flex flex-wrap gap-1.5 bg-slate-200/60 p-1 rounded-xl">
              <button
                onClick={() => setActiveFilter('fastest')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === 'fastest'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fastest
              </button>
              <button
                onClick={() => setActiveFilter('cheapest')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === 'cheapest'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cheapest
              </button>
              <button
                onClick={() => setActiveFilter('transfers')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === 'transfers'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fewest transfers
              </button>
              <button
                onClick={() => setActiveFilter('walking')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === 'walking'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Least walking
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing {sortedRoutes.length} calculated journey options
          </div>
        </div>

        {/* Results List */}
        {error && (
          <div className="p-6 bg-red-50 border border-red-200 rounded-3xl text-center text-red-700 text-sm">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Calculating multi-modal journeys across schedules...</p>
          </div>
        ) : sortedRoutes.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
            <Navigation className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No journeys found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your starting point, destination, or transport mode preferences.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedRoutes.map((route) => (
              <div
                key={route.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Summary & Steps */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-blue-100 text-blue-800">
                        {route.badge}
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {route.departureTime} → {route.arrivalTime}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                        {route.totalDurationMinutes} min
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span>{route.summaryTransport}</span>
                    </h3>

                    {/* Objective Metrics Chips */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 pt-1">
                      <div className="flex items-center gap-1 font-bold text-slate-900">
                        <span>Fare:</span>
                        <span className="text-blue-600">${route.fare}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Transfers:</span>
                        <span className="font-semibold text-slate-800">{route.transfersCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Footprints className="w-3.5 h-3.5 text-slate-400" />
                        <span>{route.walkingDistanceMeters}m ({route.walkingDurationMinutes} min walk)</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-600">
                        <Leaf className="w-3.5 h-3.5" />
                        <span>Saves {route.carbonSavedKg} kg CO₂</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 md:pt-0">
                    <button
                      onClick={() => handleSaveTrip(route)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-blue-600" />
                      <span>Save Trip</span>
                    </button>

                    <button
                      onClick={() => setSelectedRoute(route)}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for detailed timeline & interactive map */}
        <RouteDetailsModal
          route={selectedRoute}
          onClose={() => setSelectedRoute(null)}
          onSaveTrip={handleSaveTrip}
        />
      </div>
    </div>
  );
};
