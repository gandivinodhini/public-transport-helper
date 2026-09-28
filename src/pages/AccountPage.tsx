import React, { useState } from 'react';
import {
  User,
  Mail,
  Shield,
  Bell,
  Sliders,
  CheckCircle2,
  Lock,
  LogOut,
  Bus,
  Train,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface AccountPageProps {
  onOpenAuthModal: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onOpenAuthModal }) => {
  const { user, profile, updatePreferences, signOut } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.displayName || user?.displayName || '');
  const [preferredTransport, setPreferredTransport] = useState(profile?.preferredTransport || 'all');
  const [accessibilityNeeds, setAccessibilityNeeds] = useState(profile?.accessibilityNeeds || 'none');
  const [notificationsEnabled, setNotificationsEnabled] = useState(profile?.notificationsEnabled ?? true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePreferences({
      displayName,
      preferredTransport,
      accessibilityNeeds,
      notificationsEnabled,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (!user && !profile) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Sign In to TransitMate</h2>
          <p className="text-xs text-slate-500">
            Access your personalized transit preferences, saved routes, and disruption notifications across your devices.
          </p>
          <button
            onClick={onOpenAuthModal}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            Sign In with Google / Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              User Profile & Settings
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your commuting preferences and notification options.
            </p>
          </div>

          <button
            onClick={() => signOut()}
            className="px-4 py-2 border border-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile and commute preferences saved successfully.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          {/* User Info Overview */}
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold uppercase shadow-md">
              {displayName?.[0] || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{displayName || 'Commuter'}</h2>
              <p className="text-xs text-slate-500">{profile?.email || user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-100 text-blue-700">
                  {profile?.role === 'admin' ? 'System Administrator' : 'Verified Traveler'}
                </span>
                <span className="text-[11px] text-slate-400">UID: {profile?.uid?.slice(0, 10)}...</span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={profile?.email || user?.email || ''}
                disabled
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-500 cursor-not-allowed"
              />
              <p className="text-[11px] text-slate-400 mt-1">Managed via Google Authentication</p>
            </div>

            {/* Preferred Transport */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Preferred Mode of Transport
              </label>
              <select
                value={preferredTransport}
                onChange={(e) => setPreferredTransport(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Any Mode (Fastest Recommendation)</option>
                <option value="bus">City Bus Priority</option>
                <option value="metro">Rapid Metro Underground Priority</option>
                <option value="train">Commuter Rail Priority</option>
              </select>
            </div>

            {/* Accessibility Preferences */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Accessibility Preferences
              </label>
              <select
                value={accessibilityNeeds}
                onChange={(e) => setAccessibilityNeeds(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">Standard Routing (Stairs & Escalators allowed)</option>
                <option value="wheelchair">Wheelchair Accessible Only (Step-free elevators)</option>
                <option value="stroller">Stroller / Luggage Friendly</option>
                <option value="least_walking">Minimal Walking Distance Priority</option>
              </select>
            </div>

            {/* Notification Toggles */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Commute Notifications
              </label>
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Real-Time Disruption Alerts</p>
                    <p className="text-[11px] text-slate-500">
                      Receive notices about delays or route closures affecting your saved trips
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
