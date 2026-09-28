import React, { useState, useEffect } from 'react';
import {
  Shield,
  Layers,
  MapPin,
  AlertTriangle,
  Users,
  Search,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  TrendingUp,
  BarChart3,
  Bus,
  Train,
  Check,
  X,
  RefreshCw,
} from 'lucide-react';
import { TransitRoute, TransitStop, ServiceAlert, ProblemReport } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'routes' | 'stops' | 'alerts' | 'reports'>('overview');

  const [analytics, setAnalytics] = useState<any>({
    activeRoutes: 6,
    totalStops: 15,
    activeAlerts: 3,
    totalReports: 4,
    registeredUsers: 182,
    dailySearches: 1480,
    networkBreakdown: { bus: 3, metro: 2, train: 1 },
    alertsBySeverity: { normal: 3, delay: 1, disruption: 1 },
  });

  const [routes, setRoutes] = useState<TransitRoute[]>([]);
  const [stops, setStops] = useState<TransitStop[]>([]);
  const [alerts, setAlerts] = useState<ServiceAlert[]>([]);
  const [reports, setReports] = useState<ProblemReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & forms
  const [showAddRoute, setShowAddRoute] = useState(false);
  const [newRouteNum, setNewRouteNum] = useState('');
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteType, setNewRouteType] = useState<'bus' | 'metro' | 'train'>('bus');
  const [newRouteColor, setNewRouteColor] = useState('#2563EB');
  const [newRouteFare, setNewRouteFare] = useState('20');
  const [newRouteFreq, setNewRouteFreq] = useState('10');

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDesc, setAlertDesc] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'normal' | 'delay' | 'disruption'>('delay');
  const [alertType, setAlertType] = useState<'bus' | 'metro' | 'train' | 'all'>('all');
  const [alertRouteId, setAlertRouteId] = useState<string>('');

  const [showAddStop, setShowAddStop] = useState(false);
  const [stopName, setStopName] = useState('');
  const [stopCode, setStopCode] = useState('');
  const [stopType, setStopType] = useState<'bus' | 'metro' | 'train' | 'hub'>('bus');
  const [stopLat, setStopLat] = useState('1.2900');
  const [stopLng, setStopLng] = useState('103.8500');

  const loadData = async () => {
    setLoading(true);
    try {
      const token = user ? await user.getIdToken() : null;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [rRoutes, rStops, rAlerts, rReports, rAnalytics] = await Promise.all([
        fetch('/api/routes').then(r => r.json()),
        fetch('/api/stops').then(r => r.json()),
        fetch('/api/alerts').then(r => r.json()),
        fetch('/api/reports', { headers }).then(r => r.json()),
        fetch('/api/admin/analytics').then(r => r.json()),
      ]);

      setRoutes(rRoutes || []);
      setStops(rStops || []);
      setAlerts(rAlerts || []);
      setReports(rReports || []);
      if (rAnalytics && !rAnalytics.error) {
        setAnalytics(rAnalytics);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = user ? await user.getIdToken() : null;
      const res = await fetch('/api/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          routeNumber: newRouteNum,
          name: newRouteName,
          type: newRouteType,
          color: newRouteColor,
          baseFare: parseInt(newRouteFare, 10),
          frequencyMinutes: parseInt(newRouteFreq, 10),
        }),
      });

      if (res.ok) {
        setShowAddRoute(false);
        setNewRouteNum('');
        setNewRouteName('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRoute = async (id: number) => {
    if (!confirm('Are you sure you want to remove this transit line?')) return;
    try {
      const token = user ? await user.getIdToken() : null;
      await fetch(`/api/routes/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = user ? await user.getIdToken() : null;
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: alertTitle,
          description: alertDesc,
          severity: alertSeverity,
          transportType: alertType,
          routeId: alertRouteId ? parseInt(alertRouteId, 10) : null,
        }),
      });

      if (res.ok) {
        setShowAlertModal(false);
        setAlertTitle('');
        setAlertDesc('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAlert = async (id: number) => {
    try {
      const token = user ? await user.getIdToken() : null;
      await fetch(`/api/alerts/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateStop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = user ? await user.getIdToken() : null;
      const res = await fetch('/api/stops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: stopName,
          code: stopCode,
          type: stopType,
          latitude: parseFloat(stopLat),
          longitude: parseFloat(stopLng),
          accessible: true,
        }),
      });

      if (res.ok) {
        setShowAddStop(false);
        setStopName('');
        setStopCode('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStop = async (id: number) => {
    if (!confirm('Delete this stop?')) return;
    try {
      const token = user ? await user.getIdToken() : null;
      await fetch(`/api/stops/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateReportStatus = async (reportId: number, status: string) => {
    try {
      const token = user ? await user.getIdToken() : null;
      await fetch(`/api/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  TransitMate Admin Hub
                </h1>
                <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-purple-100 text-purple-700">
                  Cloud SQL
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Network operational management, route schedules, fare pricing, alerts & user reports.
              </p>
            </div>
          </div>

          <button
            onClick={loadData}
            className="self-start sm:self-auto px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live DB</span>
          </button>
        </div>

        {/* 5 KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-blue-600 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Routes</span>
              <Bus className="w-4 h-4" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{analytics.activeRoutes}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Across bus, metro & rail</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-indigo-600 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Stops</span>
              <MapPin className="w-4 h-4" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{analytics.totalStops}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Geolocated stations</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-amber-600 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Alerts</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{analytics.activeAlerts}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Live service bulletins</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-emerald-600 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Daily Searches</span>
              <Search className="w-4 h-4" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{analytics.dailySearches}</p>
            <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">+14% vs yesterday</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-purple-600 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Commuters</span>
              <Users className="w-4 h-4" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{analytics.registeredUsers}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Registered user profiles</p>
          </div>
        </div>

        {/* Visual Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hourly Commuting Volume Simulation */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Commuter Search Volume (Peak Hours)</h3>
                <p className="text-xs text-slate-500">Hourly journey queries over the past 24 hours</p>
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                Morning Peak 8:00 AM
              </span>
            </div>

            {/* Bar Chart Representation */}
            <div className="h-44 flex items-end justify-between gap-1.5 pt-4">
              {[
                { time: '6am', val: 35 },
                { time: '7am', val: 65 },
                { time: '8am', val: 100 },
                { time: '9am', val: 85 },
                { time: '10am', val: 40 },
                { time: '11am', val: 30 },
                { time: '12pm', val: 55 },
                { time: '1pm', val: 45 },
                { time: '2pm', val: 35 },
                { time: '3pm', val: 40 },
                { time: '4pm', val: 58 },
                { time: '5pm', val: 92 },
                { time: '6pm', val: 95 },
                { time: '7pm', val: 70 },
                { time: '8pm', val: 45 },
                { time: '9pm', val: 25 },
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div
                    className="w-full rounded-t-lg bg-blue-500/80 group-hover:bg-blue-600 transition-all"
                    style={{ height: `${item.val}%` }}
                    title={`${item.time}: ${item.val}% load`}
                  />
                  <span className="text-[10px] text-slate-400 font-medium scale-90">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mode Share Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Transport Network Distribution</h3>
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>City Bus Lines</span>
                  <span>50%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '50%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Rapid Metro</span>
                  <span>33%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-sky-500 h-2.5 rounded-full" style={{ width: '33%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Commuter Rail</span>
                  <span>17%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '17%' }} />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
              Database powered by PostgreSQL on Google Cloud SQL with ACID compliance.
            </div>
          </div>
        </div>

        {/* Management Tabs Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'routes', label: `Routes (${routes.length})` },
            { id: 'stops', label: `Stops & Stations (${stops.length})` },
            { id: 'alerts', label: `Service Alerts (${alerts.length})` },
            { id: 'reports', label: `Commuter Reports (${reports.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1 & 2: Routes Management */}
        {(activeTab === 'overview' || activeTab === 'routes') && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Transport Routes & Fares</h3>
                <p className="text-xs text-slate-500">Configure lines, base fares, intervals, and statuses</p>
              </div>

              <button
                onClick={() => setShowAddRoute(!showAddRoute)}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Route</span>
              </button>
            </div>

            {/* Add Route Form */}
            {showAddRoute && (
              <form onSubmit={handleCreateRoute} className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-3">
                <h4 className="text-xs font-bold text-purple-900">New Transit Line Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newRouteNum}
                    onChange={(e) => setNewRouteNum(e.target.value)}
                    placeholder="Route # (e.g. Bus 105)"
                    className="bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs"
                    required
                  />
                  <input
                    type="text"
                    value={newRouteName}
                    onChange={(e) => setNewRouteName(e.target.value)}
                    placeholder="Route Name (e.g. Airport Shuttle)"
                    className="bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs"
                    required
                  />
                  <select
                    value={newRouteType}
                    onChange={(e) => setNewRouteType(e.target.value as any)}
                    className="bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="bus">Bus</option>
                    <option value="metro">Metro</option>
                    <option value="train">Train</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="number"
                    value={newRouteFare}
                    onChange={(e) => setNewRouteFare(e.target.value)}
                    placeholder="Base Fare ($)"
                    className="bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs"
                    required
                  />
                  <input
                    type="number"
                    value={newRouteFreq}
                    onChange={(e) => setNewRouteFreq(e.target.value)}
                    placeholder="Frequency (mins)"
                    className="bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs"
                    required
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddRoute(false)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold"
                    >
                      Save Route
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Routes Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Route</th>
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Base Fare</th>
                    <th className="pb-3">Frequency</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {routes.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-3 font-bold text-slate-900">{r.routeNumber}</td>
                      <td className="py-3 text-slate-700">{r.name}</td>
                      <td className="py-3 uppercase text-[11px] font-bold text-slate-500">{r.type}</td>
                      <td className="py-3 font-bold text-slate-800">${r.baseFare}</td>
                      <td className="py-3">{r.frequencyMinutes} min</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            r.status === 'normal'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.status === 'delay'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteRoute(r.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Delete route"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Stops Management */}
        {(activeTab === 'overview' || activeTab === 'stops') && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Transit Stops & Hubs</h3>
                <p className="text-xs text-slate-500">Manage geolocation coordinates and accessibility features</p>
              </div>

              <button
                onClick={() => setShowAddStop(!showAddStop)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stop</span>
              </button>
            </div>

            {showAddStop && (
              <form onSubmit={handleCreateStop} className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={stopName}
                    onChange={(e) => setStopName(e.target.value)}
                    placeholder="Stop Name (e.g. Marina Central)"
                    className="bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs"
                    required
                  />
                  <input
                    type="text"
                    value={stopCode}
                    onChange={(e) => setStopCode(e.target.value)}
                    placeholder="Stop Code (e.g. MCN-01)"
                    className="bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs"
                  />
                  <select
                    value={stopType}
                    onChange={(e) => setStopType(e.target.value as any)}
                    className="bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="bus">Bus Stop</option>
                    <option value="metro">Metro Station</option>
                    <option value="train">Train Station</option>
                    <option value="hub">Transit Hub</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={stopLat}
                    onChange={(e) => setStopLat(e.target.value)}
                    placeholder="Latitude"
                    className="bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs"
                    required
                  />
                  <input
                    type="text"
                    value={stopLng}
                    onChange={(e) => setStopLng(e.target.value)}
                    placeholder="Longitude"
                    className="bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs"
                    required
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddStop(false)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                    >
                      Save Stop
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stops.map((s) => (
                <div key={s.id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50 flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{s.name}</h4>
                    <p className="text-[11px] text-slate-500 uppercase">{s.type} • {s.code || 'N/A'}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteStop(s.id)}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Service Alerts */}
        {(activeTab === 'overview' || activeTab === 'alerts') && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Broadcast Service Bulletins & Alerts</h3>
                <p className="text-xs text-slate-500">Inform all commuters of delays, rerouting, or maintenance</p>
              </div>

              <button
                onClick={() => setShowAlertModal(!showAlertModal)}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Publish Alert</span>
              </button>
            </div>

            {showAlertModal && (
              <form onSubmit={handleCreateAlert} className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
                <input
                  type="text"
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  placeholder="Alert Title (e.g. Signal Delay near Central Hub)"
                  className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-bold"
                  required
                />
                <textarea
                  rows={2}
                  value={alertDesc}
                  onChange={(e) => setAlertDesc(e.target.value)}
                  placeholder="Full bulletin description..."
                  className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs"
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={alertSeverity}
                    onChange={(e) => setAlertSeverity(e.target.value as any)}
                    className="bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="delay">Minor Delay</option>
                    <option value="disruption">Service Disruption</option>
                    <option value="normal">Normal Service Resumed</option>
                  </select>
                  <select
                    value={alertType}
                    onChange={(e) => setAlertType(e.target.value as any)}
                    className="bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="all">All Transit</option>
                    <option value="bus">Bus</option>
                    <option value="metro">Metro</option>
                    <option value="train">Train</option>
                  </select>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAlertModal(false)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold"
                    >
                      Broadcast
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {alerts.map((a) => (
                <div key={a.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-xs">{a.title}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {a.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{a.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAlert(a.id)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Commuter Problem Reports */}
        {(activeTab === 'overview' || activeTab === 'reports') && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">User Problem Reports</h3>
            <p className="text-xs text-slate-500">Submitted station and delay reports requiring investigation</p>

            <div className="divide-y divide-slate-100">
              {reports.map((rep) => (
                <div key={rep.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{rep.reportId}</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold uppercase">
                        {rep.category}
                      </span>
                      <span className="text-xs text-slate-500">{rep.route} • {rep.location}</span>
                    </div>
                    <p className="text-xs text-slate-600">{rep.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={rep.status}
                      onChange={(e) => handleUpdateReportStatus(rep.id, e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      <option value="under_review">Under Review</option>
                      <option value="investigating">Investigating</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
