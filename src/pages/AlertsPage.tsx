import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  RefreshCw,
  Info,
  Bus,
  Train,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { ServiceAlert } from '../types.ts';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<ServiceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/alerts?type=${typeFilter}`);
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch service alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [typeFilter]);

  const filteredAlerts = alerts.filter(a => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      (a.routeName && a.routeName.toLowerCase().includes(q)) ||
      (a.routeNumber && a.routeNumber.toLowerCase().includes(q))
    );
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'disruption':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>Service Disruption</span>
          </div>
        );
      case 'delay':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Minor Delays</span>
          </div>
        );
      case 'normal':
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Normal Service</span>
          </div>
        );
    }
  };

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'bus':
        return <Bus className="w-4 h-4 text-blue-600" />;
      case 'metro':
        return <Train className="w-4 h-4 text-sky-600" />;
      case 'train':
        return <Train className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  const getTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Updated just now';
    const d = new Date(dateStr);
    const diffMin = Math.max(1, Math.floor((Date.now() - d.getTime()) / 60000));
    if (diffMin < 60) return `Updated ${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    const diffHours = Math.floor(diffMin / 60);
    return `Updated ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Live Transport Status & Alerts
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Official operating statuses, track maintenance, diversions, and delays across network lines.
            </p>
          </div>

          <button
            onClick={fetchAlerts}
            className="self-start sm:self-auto px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Alerts</span>
          </button>
        </div>

        {/* Clear Separation Banner: Scheduled vs Live Simulation Notice */}
        <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Transparent Transit Data Notice</p>
            <p className="text-blue-800 leading-relaxed">
              Standard timetables represent scheduled transit timetables. Status badges (🟢 Normal, 🟡 Delays, 🔴 Disruption) reflect simulated real-time operational feeds for this prototype preview. Live GTFS-RT APIs can be plugged in directly for production feeds.
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search route name or number (e.g. Bus 216, Blue Line)..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl self-start sm:self-auto">
            {['all', 'bus', 'metro', 'train'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                  typeFilter === type
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type === 'all' ? 'All Lines' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts List */}
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-medium text-slate-500">Checking network operational status...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">All Systems Operational</h3>
            <p className="text-xs text-slate-500">No active alerts found for this filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-100">
                      {getTransportIcon(alert.transportType)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {alert.title}
                      </h3>
                      {alert.routeName && (
                        <p className="text-xs font-medium text-slate-500">
                          {alert.routeName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getSeverityBadge(alert.severity)}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-1 sm:pl-11">
                  {alert.description}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 pl-1 sm:pl-11">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{getTimeAgo(alert.updatedAt)}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Transit Operational Feed
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
