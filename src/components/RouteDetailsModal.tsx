import React, { useState } from 'react';
import {
  X,
  Footprints,
  Bus,
  Train,
  ArrowRight,
  Clock,
  MapPin,
  Bookmark,
  Share2,
  QrCode,
  ShieldCheck,
  Leaf,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';
import { MapComponent } from './MapComponent.tsx';
import { RouteOption } from '../types.ts';

interface RouteDetailsModalProps {
  route: RouteOption | null;
  onClose: () => void;
  onSaveTrip: (route: RouteOption) => void;
}

export const RouteDetailsModal: React.FC<RouteDetailsModalProps> = ({
  route,
  onClose,
  onSaveTrip,
}) => {
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedStops, setExpandedStops] = useState<Record<string, boolean>>({});

  if (!route) return null;

  const toggleStopList = (stepId: string) => {
    setExpandedStops(prev => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'bus':
        return <Bus className="w-4 h-4 text-blue-600" />;
      case 'metro':
        return <Train className="w-4 h-4 text-sky-600" />;
      case 'train':
        return <Train className="w-4 h-4 text-red-600" />;
      case 'walk':
      case 'transfer':
      default:
        return <Footprints className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col relative border border-slate-100">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-100 text-blue-800">
                {route.badge}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {route.departureTime} — {route.arrivalTime} ({route.totalDurationMinutes} mins)
              </span>
              <span className="text-xs font-bold text-slate-800 bg-slate-200/70 px-2 py-0.5 rounded-md">
                ${route.fare}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {route.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              {route.summaryTransport}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSaveTrip(route)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Save Trip"
            >
              <Bookmark className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Save Trip</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Share Route"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={() => setShowQr(!showQr)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
              title="QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* QR Code Overlay */}
        {showQr && (
          <div className="p-6 bg-blue-50 border-b border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-white p-2 rounded-xl shadow-md border border-blue-200 flex items-center justify-center">
                {/* SVG mock QR Code */}
                <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100">
                  <rect width="100" height="100" fill="white" />
                  <path fill="#0F172A" d="M10,10 h30 v30 h-30 z M15,15 v20 h20 v-20 z M20,20 h10 v10 h-10 z" />
                  <path fill="#0F172A" d="M60,10 h30 v30 h-30 z M65,15 v20 h20 v-20 z M70,20 h10 v10 h-10 z" />
                  <path fill="#0F172A" d="M10,60 h30 v30 h-30 z M15,65 v20 h20 v-20 z M20,70 h10 v10 h-10 z" />
                  <rect x="45" y="15" width="8" height="15" fill="#0F172A" />
                  <rect x="50" y="45" width="20" height="8" fill="#0F172A" />
                  <rect x="45" y="65" width="10" height="20" fill="#0F172A" />
                  <rect x="65" y="60" width="15" height="10" fill="#0F172A" />
                  <rect x="75" y="75" width="12" height="12" fill="#0F172A" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Scan to ride with mobile</h4>
                <p className="text-xs text-slate-600 mt-1 max-w-sm">
                  Point your smartphone camera to open this itinerary in TransitMate mobile PWA with real-time station alerts.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowQr(false)}
              className="text-xs text-blue-700 font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Content Body: Split between Map and Timeline */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* Timeline column */}
          <div className="lg:col-span-6 p-6 space-y-6 overflow-y-auto max-h-[60vh] lg:max-h-none">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Transfers</p>
                <p className="text-sm font-bold text-slate-900">{route.transfersCount}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Walking</p>
                <p className="text-sm font-bold text-slate-900">{route.walkingDistanceMeters}m ({route.walkingDurationMinutes}m)</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Carbon Saved</p>
                <p className="text-sm font-bold text-emerald-600 flex items-center justify-center gap-0.5">
                  <Leaf className="w-3 h-3" />
                  {route.carbonSavedKg} kg
                </p>
              </div>
            </div>

            {/* Step-by-Step Timeline */}
            <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {route.steps.map((step, idx) => {
                const isWalk = step.type === 'walk' || step.type === 'transfer';
                const hasStops = step.stopsList && step.stopsList.length > 0;
                const isExpanded = expandedStops[step.id];

                return (
                  <div key={step.id} className="relative">
                    {/* Circle Node Icon */}
                    <div
                      className={`absolute -left-6 top-0 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
                        isWalk ? 'bg-slate-400 text-white' : 'bg-blue-600 text-white'
                      }`}
                      style={{ backgroundColor: !isWalk && step.routeColor ? step.routeColor : undefined }}
                    >
                      {getStepIcon(step.type)}
                    </div>

                    {/* Step Content */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">
                          {step.timeString} — {step.instruction}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {step.durationMinutes} min
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">{step.detail}</p>

                      {step.distanceMeters > 0 && isWalk && (
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <Footprints className="w-3 h-3" />
                          Walk {step.distanceMeters} meters
                        </p>
                      )}

                      {/* Intermediate Stops Dropdown */}
                      {hasStops && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => toggleStopList(step.id)}
                            className="flex items-center justify-between w-full text-xs font-semibold text-blue-600 hover:text-blue-700"
                          >
                            <span>
                              {isExpanded ? 'Hide' : 'View'} {step.stopsCount} stops along route
                            </span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          {isExpanded && (
                            <div className="mt-2 pl-3 border-l-2 border-blue-200 space-y-1.5 text-xs text-slate-600">
                              {step.stopsList!.map((stopName, sIdx) => (
                                <div key={sIdx} className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                  <span>{stopName}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map Column */}
          <div className="lg:col-span-6 p-4 flex flex-col justify-between bg-slate-50">
            <div className="mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Interactive Journey Route Map
              </h4>
            </div>

            <MapComponent
              selectedRouteSteps={route.steps}
              originName={route.departureStop}
              destinationName={route.arrivalStop}
              className="h-[380px] sm:h-[450px] w-full rounded-2xl shadow-sm border border-slate-200"
            />

            <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Wheelchair & step-free accessible transit path</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Live Geometry</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
