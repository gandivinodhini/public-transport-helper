import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  Send,
  Upload,
  Camera,
  Shield,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { ProblemReport } from '../types.ts';

export const ReportPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [transportType, setTransportType] = useState('bus');
  const [route, setRoute] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<ProblemReport['category']>('delay');
  const [description, setDescription] = useState('');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<{ id: string; status: string } | null>(null);
  const [myReports, setMyReports] = useState<ProblemReport[]>([]);

  const fetchMyReports = async () => {
    try {
      const token = user ? await user.getIdToken() : null;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch('/api/reports', { headers });
      if (res.ok) {
        const data = await res.json();
        setMyReports(data);
      }
    } catch {
      // Local fallback
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !route.trim()) return;

    setSubmitting(true);
    try {
      const token = user ? await user.getIdToken() : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          transportType,
          route,
          location,
          category,
          description,
          userEmail: user?.email || userEmail || 'anonymous@transitmate.app',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSubmittedReport({ id: data.reportId, status: data.status });
        // Reset form
        setDescription('');
        setRoute('');
        setLocation('');
        fetchMyReports();
      }
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
      case 'investigating':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Investigating
          </span>
        );
      case 'under_review':
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Under Review
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Report a Transportation Problem
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Encountered a delay, inaccurate departure time, missing stop, or infrastructure issue? Help keep the transit system accurate.
          </p>
        </div>

        {/* Success Modal / Banner */}
        {submittedReport && (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl shadow-sm space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2.5 text-emerald-800 font-bold">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span className="text-base">Report Submitted Successfully!</span>
            </div>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Your feedback has been logged in the transit maintenance registry.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <div className="px-3 py-1.5 bg-white rounded-xl border border-emerald-300 text-xs font-mono font-bold text-slate-800">
                Report ID: {submittedReport.id}
              </div>
              <div className="text-xs font-bold text-emerald-700">
                Status: Under Review
              </div>
            </div>
          </div>
        )}

        {/* Report Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Issue Details
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Transport Type
                </label>
                <select
                  value={transportType}
                  onChange={(e) => setTransportType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bus">City Bus</option>
                  <option value="metro">Rapid Metro</option>
                  <option value="train">Commuter Train</option>
                  <option value="hub">Transit Hub / Station</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Route Number or Line Name
                </label>
                <input
                  type="text"
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  placeholder="e.g. Bus 216, Blue Line"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Location or Stop
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Orchard Boulevard Station Platform 2"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Problem Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="delay">Unscheduled Delay</option>
                  <option value="wrong_information">Wrong Schedule / Info</option>
                  <option value="missing_stop">Missing or Skipped Stop</option>
                  <option value="broken_infrastructure">Broken Infrastructure (Ticket gate, Display board)</option>
                  <option value="accessibility_issue">Accessibility Issue (Elevator out of order)</option>
                  <option value="other">Other Issue</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Description of the Issue
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what occurred, vehicle number if known, and current station conditions..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                required
              />
            </div>

            {/* Optional Photo Attachment */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Photo (Optional)
              </label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-slate-50 cursor-pointer transition-colors">
                <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <p className="text-xs font-medium text-slate-600">Tap to upload a photo of station or timetable</p>
                <p className="text-[10px] text-slate-400 mt-0.5">JPEG, PNG up to 5MB</p>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting...' : 'Submit Problem Report'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* User's Past Reports History */}
        {myReports.length > 0 && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Your Submitted Reports
            </h2>
            <div className="divide-y divide-slate-100">
              {myReports.map((report) => (
                <div key={report.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-900">{report.reportId}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-medium text-slate-600">{report.route} ({report.location})</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{report.description}</p>
                  </div>
                  <div>{getStatusBadge(report.status)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
