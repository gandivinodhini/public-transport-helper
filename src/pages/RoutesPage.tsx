import React, { useState, useEffect } from 'react';
import {
  Clock,
  Bus,
  Train,
  ChevronDown,
  ChevronUp,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Navigation,
} from 'lucide-react';
import { TransitRoute, TransitStop } from '../types.ts';
import { DEFAULT_ROUTES } from '../data/defaultTransitData.ts';

interface RoutesPageProps {
  onPlanTripFromRoute?: (routeName: string) => void;
}

export const RoutesPage: React.FC<RoutesPageProps> = ({ onPlanTripFromRoute }) => {
  const [routes, setRoutes] = useState<TransitRoute[]>(DEFAULT_ROUTES);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [expandedRouteId, setExpandedRouteId] = useState<number | null>(null);
  const [routeDetails, setRouteDetails] = useState<any>(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await fetch('/api/routes');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setRoutes(data);
            return;
          }
        }
      } catch {
        setRoutes(DEFAULT_ROUTES);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, []);

  const handleToggleRoute = async (id: number) => {
    if (expandedRouteId === id) {
      setExpandedRouteId(null);
      setRouteDetails(null);
      return;
    }
    setExpandedRouteId(id);
    try {
      const res = await fetch(`/api/routes/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRouteDetails(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRoutes = routes.filter(r => selectedType === 'all' || r.type === selectedType);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Transit Routes & Schedules
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse complete timetables, base fares, intervals, and stops for all city bus, metro, and rail lines.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl self-start max-w-fit">
          {['all', 'bus', 'metro', 'train'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                selectedType === t
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t === 'all' ? 'All Lines' : `${t} Lines`}
            </button>
          ))}
        </div>

        {/* Routes Cards List */}
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Loading line schedules...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRoutes.map((route) => {
              const isExpanded = expandedRouteId === route.id;

              return (
                <div
                  key={route.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 hover:border-slate-300 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-md"
                        style={{ backgroundColor: route.color || '#2563EB' }}
                      >
                        {route.type === 'bus' ? <Bus className="w-6 h-6" /> : <Train className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">{route.routeNumber}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              route.status === 'normal'
                                ? 'bg-emerald-100 text-emerald-800'
                                : route.status === 'delay'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {route.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{route.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                      <div>
                        <span className="text-slate-400">Headway:</span> Every {route.frequencyMinutes} min
                      </div>
                      <div>
                        <span className="text-slate-400">Base Fare:</span> ${route.baseFare}
                      </div>
                      <button
                        onClick={() => handleToggleRoute(route.id)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 text-xs"
                      >
                        <span>{isExpanded ? 'Hide' : 'Stops'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {route.description && (
                    <p className="text-xs text-slate-600 leading-relaxed">{route.description}</p>
                  )}

                  {/* Expanded Timetable / Stop Sequence */}
                  {isExpanded && routeDetails && (
                    <div className="pt-4 border-t border-slate-100 space-y-3 animate-in fade-in">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Scheduled Stops & Departures
                      </h4>

                      {routeDetails.schedules && routeDetails.schedules.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                          {routeDetails.schedules.map((item: any, idx: number) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-slate-900 truncate">{item.stop.name}</span>
                                <span className="font-mono text-[11px] text-blue-600 font-semibold">{item.schedule.departureTime}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 uppercase">Stop #{item.schedule.stopSequence}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No scheduled timetable points available.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
