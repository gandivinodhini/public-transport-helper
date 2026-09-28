import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { PlannerPage } from './pages/PlannerPage.tsx';
import { NearbyPage } from './pages/NearbyPage.tsx';
import { RoutesPage } from './pages/RoutesPage.tsx';
import { AlertsPage } from './pages/AlertsPage.tsx';
import { SavedTripsPage } from './pages/SavedTripsPage.tsx';
import { AccountPage } from './pages/AccountPage.tsx';
import { ReportPage } from './pages/ReportPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { TransitStop, ServiceAlert } from './types.ts';
import { Navigation, Heart, Shield, Leaf } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const [allStops, setAllStops] = useState<TransitStop[]>([]);
  const [alertsCount, setAlertsCount] = useState<number>(0);

  // Search parameters passed from Home to Planner
  const [plannerParams, setPlannerParams] = useState<{
    origin: string;
    destination: string;
    departureTime: string;
    date: string;
    transportPreference: string;
  }>({
    origin: 'Central Transit Hub',
    destination: 'University Station',
    departureTime: '08:30',
    date: new Date().toISOString().split('T')[0],
    transportPreference: 'all',
  });

  useEffect(() => {
    // Fetch initial stops and active alerts count
    const initData = async () => {
      try {
        const [stopsRes, alertsRes] = await Promise.all([
          fetch('/api/stops'),
          fetch('/api/alerts'),
        ]);
        if (stopsRes.ok) {
          const stops = await stopsRes.json();
          setAllStops(stops);
        }
        if (alertsRes.ok) {
          const alerts: ServiceAlert[] = await alertsRes.json();
          const delaysOrDisruptions = alerts.filter(a => a.severity !== 'normal').length;
          setAlertsCount(delaysOrDisruptions);
        }
      } catch (err) {
        console.error('Failed to load initial transit data:', err);
      }
    };
    initData();
  }, []);

  const handleHomeSearch = (params: {
    origin: string;
    destination: string;
    departureTime: string;
    date: string;
    transportPreference: string;
  }) => {
    setPlannerParams(params);
    setActiveTab('planner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlanTripDirect = (orig: string, dest?: string) => {
    setPlannerParams(prev => ({
      ...prev,
      origin: orig,
      destination: dest || prev.destination,
    }));
    setActiveTab('planner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-500 selection:text-white antialiased text-slate-900">
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenAuthModal={() => {
            setAuthModalMode('login');
            setAuthModalOpen(true);
          }}
          alertsCount={alertsCount}
        />

        {/* Page Content */}
        <main className="flex-1">
          {activeTab === 'home' && (
            <HomePage
              onSearch={handleHomeSearch}
              stops={allStops}
              onSelectDestination={(dest) => handlePlanTripDirect(plannerParams.origin, dest)}
              onNavigateToTab={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {activeTab === 'planner' && (
            <PlannerPage
              initialOrigin={plannerParams.origin}
              initialDestination={plannerParams.destination}
              initialTime={plannerParams.departureTime}
              initialDate={plannerParams.date}
              initialPref={plannerParams.transportPreference}
              onSaveTripNotify={() => {
                // optionally notify
              }}
            />
          )}

          {activeTab === 'nearby' && (
            <NearbyPage
              onPlanTripFromStop={(stopName) => handlePlanTripDirect(stopName)}
            />
          )}

          {activeTab === 'routes' && (
            <RoutesPage
              onPlanTripFromRoute={(routeName) => handlePlanTripDirect(routeName)}
            />
          )}

          {activeTab === 'alerts' && <AlertsPage />}

          {activeTab === 'saved' && (
            <SavedTripsPage
              onPlanTrip={(orig, dest) => handlePlanTripDirect(orig, dest)}
              onOpenAuthModal={() => setAuthModalOpen(true)}
            />
          )}

          {activeTab === 'account' && (
            <AccountPage onOpenAuthModal={() => setAuthModalOpen(true)} />
          )}

          {activeTab === 'report' && <ReportPage />}

          {activeTab === 'admin' && <AdminPage />}
        </main>

        {/* Global Footer */}
        <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-white">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                    <Navigation className="w-4 h-4 -rotate-45" />
                  </div>
                  <span className="text-lg font-bold tracking-tight">TransitMate</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Your smart public transport helper. Plan journeys, compare routes, and commute with confidence.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Quick Navigation</h4>
                <ul className="space-y-2">
                  <li>
                    <button onClick={() => { setActiveTab('planner'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                      Journey Planner
                    </button>
                  </li>
                  <li>
                    <button onClick={() => { setActiveTab('nearby'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                      Nearby Stations
                    </button>
                  </li>
                  <li>
                    <button onClick={() => { setActiveTab('routes'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                      Line Timetables
                    </button>
                  </li>
                  <li>
                    <button onClick={() => { setActiveTab('alerts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                      Live Delays & Alerts
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Commuter Services</h4>
                <ul className="space-y-2">
                  <li>
                    <button onClick={() => { setActiveTab('saved'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                      Saved Frequent Trips
                    </button>
                  </li>
                  <li>
                    <button onClick={() => { setActiveTab('report'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                      Report Transit Issue
                    </button>
                  </li>
                  <li>
                    <button onClick={() => { setActiveTab('account'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                      Accessibility & Profile
                    </button>
                  </li>
                  <li>
                    <button onClick={() => { setActiveTab('admin'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                      Admin Hub
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-white font-semibold">Reliable Architecture</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  PostgreSQL relational database via Google Cloud SQL, Firebase Auth, Leaflet OpenStreetMap integration, and multi-modal routing algorithms.
                </p>
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>All transit APIs & database operational</span>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
              <p>© {new Date().getFullYear()} TransitMate. All rights reserved.</p>
              <p className="flex items-center gap-1">
                <span>Designed for sustainable public transit</span>
                <Leaf className="w-3.5 h-3.5 text-emerald-500" />
              </p>
            </div>
          </div>
        </footer>

        {/* Global Auth Modal */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          defaultMode={authModalMode}
        />
      </div>
    </AuthProvider>
  );
}
