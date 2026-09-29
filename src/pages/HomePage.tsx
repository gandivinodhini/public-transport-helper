import React, { useState } from 'react';
import {
  Navigation,
  MapPin,
  Clock,
  Calendar,
  ArrowRight,
  Bus,
  Train,
  Footprints,
  Compass,
  Sparkles,
  ShieldCheck,
  Leaf,
  Layers,
  ArrowRightLeft,
  ChevronRight,
  CheckCircle2,
  Bot,
  MessageSquare,
} from 'lucide-react';
import { MapComponent } from '../components/MapComponent.tsx';
import { TransitStop } from '../types.ts';
import { openN8nChat } from '../components/N8nChatWidget.tsx';

interface HomePageProps {
  onSearch: (params: {
    origin: string;
    destination: string;
    departureTime: string;
    date: string;
    transportPreference: string;
  }) => void;
  stops: TransitStop[];
  onSelectDestination: (destName: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSearch,
  stops,
  onSelectDestination,
  onNavigateToTab,
}) => {
  const [origin, setOrigin] = useState('Central Transit Hub');
  const [destination, setDestination] = useState('University Station');
  const [departureType, setDepartureType] = useState<'depart' | 'arrive'>('depart');
  const [time, setTime] = useState('08:30');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [transportPref, setTransportPref] = useState('all');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Central Transit Hub → Marina Bay Station',
    'Orchard Boulevard → Airport Terminal 1-3',
    'University Station → Downtown Plaza',
  ]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin(`Current Location (${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)})`);
        setGettingLocation(false);
      },
      () => {
        // Fallback friendly location
        setOrigin('Central Transit Hub (Current Area)');
        setGettingLocation(false);
      },
      { timeout: 5000 }
    );
  };

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return;

    // Save to recents
    const searchLabel = `${origin} → ${destination}`;
    setRecentSearches(prev => [searchLabel, ...prev.filter(s => s !== searchLabel)].slice(0, 4));

    onSearch({
      origin,
      destination,
      departureTime: time,
      date,
      transportPreference: transportPref,
    });
  };

  const popularDestinations = [
    { name: 'Marina Bay Station', type: 'metro', desc: 'Financial district & waterfront' },
    { name: 'Airport Terminal 1-3', type: 'train', desc: 'Direct express rail link' },
    { name: 'Central Transit Hub', type: 'hub', desc: 'Central connection terminal' },
    { name: 'Orchard Boulevard', type: 'metro', desc: 'Retail & business hub' },
    { name: 'University Station', type: 'bus', desc: 'Higher education precinct' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white pt-14 pb-24">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#60A5FA_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-4 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Smart Multi-Modal Transit Assistant</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4">
              Get there <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400">smarter.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed">
              Plan your journey, compare transport options, and travel with confidence across bus, metro, and rail lines.
            </p>

            {/* Transport Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-6">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-slate-200">
                <Bus className="w-4 h-4 text-blue-400" />
                <span>City Bus</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-slate-200">
                <Train className="w-4 h-4 text-sky-400" />
                <span>Rapid Metro</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-slate-200">
                <Train className="w-4 h-4 text-emerald-400" />
                <span>Commuter Rail</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-slate-200">
                <Footprints className="w-4 h-4 text-amber-400" />
                <span>Pedestrian Walks</span>
              </div>
            </div>
          </div>

          {/* Large Journey Planner Card */}
          <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Origin & Destination Inputs */}
              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* From input */}
                <div className="relative">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    From (Starting Location)
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-blue-600">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-600 bg-white" />
                    </div>
                    <input
                      type="text"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="Enter origin station, address or landmark"
                      className="w-full pl-10 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={gettingLocation}
                      className="absolute right-2.5 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors flex items-center gap-1"
                      title="Use current GPS location"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>{gettingLocation ? 'Locating...' : 'GPS'}</span>
                    </button>
                  </div>
                </div>

                {/* Swap button for mobile/desktop */}
                <button
                  type="button"
                  onClick={handleSwap}
                  className="hidden md:flex absolute left-1/2 top-9 -translate-x-1/2 z-10 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-400 hover:scale-105 transition-all"
                  title="Swap locations"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>

                {/* To input */}
                <div className="relative">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    To (Destination)
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-red-500">
                      <MapPin className="w-4 h-4 text-red-500" />
                    </div>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Enter destination stop, line or place"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Time, Date and Transport Preference Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {/* Departure Type & Time */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Departure / Arrival
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={departureType}
                      onChange={(e) => setDepartureType(e.target.value as any)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="depart">Depart at</option>
                      <option value="arrive">Arrive by</option>
                    </select>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Travel Date
                  </label>
                  <div className="relative flex items-center">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Transport Mode Preference */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Transport Preference
                  </label>
                  <select
                    value={transportPref}
                    onChange={(e) => setTransportPref(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Any Transport (Fastest)</option>
                    <option value="bus">Buses Only</option>
                    <option value="metro">Metro / Underground Only</option>
                    <option value="train">Commuter Trains Only</option>
                  </select>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Navigation className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                  <span>Find Best Routes</span>
                </button>
              </div>
            </form>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Recent Searches
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const [orig, dest] = search.split(' → ');
                        setOrigin(orig);
                        setDestination(dest);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{search}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* n8n AI Assistant Quick Callout */}
            <div className="mt-5 p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Need personal travel advice?</h4>
                  <p className="text-[11px] text-slate-600">
                    Ask Nathan, our n8n AI Assistant, about transfers, station amenities, and line delays.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={openN8nChat}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 self-end sm:self-auto cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat with Nathan</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        {/* Popular Destinations Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Popular Destinations
              </h2>
              <p className="text-sm text-slate-500">Quickly plan trips to major transit hubs and points of interest</p>
            </div>
            <button
              onClick={() => onNavigateToTab('routes')}
              className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Explore all routes</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularDestinations.map((dest, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setDestination(dest.name);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                      {dest.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">{dest.desc}</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Live Network Map Preview */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Active Transit Network
                </h2>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Explore real-time stops, metro hubs, and connection points across the city
              </p>
            </div>

            <button
              onClick={() => onNavigateToTab('nearby')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Find Stops Near Me</span>
            </button>
          </div>

          <MapComponent stops={stops} className="h-96 w-full rounded-2xl shadow-inner border border-slate-100" />
        </section>

        {/* Value Proposition Highlights */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Eco-Friendly & Low Carbon</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every route shows estimated CO₂ savings compared to driving a personal vehicle. Track your positive environmental impact.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Step-Free Accessibility</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Filter for wheelchair and stroller accessible journeys with elevators, gentle ramps, and audio-visual transit announcements.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Live Delays & Alerts</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Stay ahead of unexpected track work, road diversions, and weather disruptions with verified community and agency updates.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
