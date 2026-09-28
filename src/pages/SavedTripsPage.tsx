import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  Navigation,
  Edit2,
  Trash2,
  Check,
  X,
  MapPin,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { SavedTrip } from '../types.ts';

interface SavedTripsPageProps {
  onPlanTrip: (origin: string, destination: string) => void;
  onOpenAuthModal: () => void;
}

export const SavedTripsPage: React.FC<SavedTripsPageProps> = ({
  onPlanTrip,
  onOpenAuthModal,
}) => {
  const { user, profile } = useAuth();
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);

  // Editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // New trip modal / inline form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newOrigin, setNewOrigin] = useState('');
  const [newDestination, setNewDestination] = useState('');

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const token = user ? await user.getIdToken() : null;
      if (token) {
        const res = await fetch('/api/saved-trips', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setTrips(data);
          setLoading(false);
          return;
        }
      }

      // Guest / Demo fallback from local storage
      const local = JSON.parse(localStorage.getItem('transitmate_saved_trips') || '[]');
      if (local.length === 0) {
        // Sample default common journeys as specified in prompt
        const defaults = [
          {
            id: 101,
            userId: 1,
            title: 'Home → College',
            origin: 'Orchard Boulevard',
            destination: 'University Station',
            notes: 'Metro Blue Line (28 mins)',
            createdAt: new Date().toISOString(),
          },
          {
            id: 102,
            userId: 1,
            title: 'Home → Office',
            origin: 'Downtown Plaza',
            destination: 'Marina Bay Station',
            notes: 'Bus 216 Direct (18 mins)',
            createdAt: new Date().toISOString(),
          },
          {
            id: 103,
            userId: 1,
            title: 'College → Railway Station',
            origin: 'University Station',
            destination: 'North Rail Junction',
            notes: 'Green Line + Express Train 101 (35 mins)',
            createdAt: new Date().toISOString(),
          },
        ];
        localStorage.setItem('transitmate_saved_trips', JSON.stringify(defaults));
        setTrips(defaults as any);
      } else {
        setTrips(local);
      }
    } catch (err) {
      console.error('Failed to fetch saved trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [user]);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrigin.trim() || !newDestination.trim()) return;

    const payload = {
      title: newTitle || `${newOrigin} → ${newDestination}`,
      origin: newOrigin,
      destination: newDestination,
      notes: 'Custom saved journey',
    };

    try {
      const token = user ? await user.getIdToken() : null;
      if (token) {
        const res = await fetch('/api/saved-trips', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const created = await res.json();
          setTrips([created, ...trips]);
          setShowAddForm(false);
          setNewTitle('');
          setNewOrigin('');
          setNewDestination('');
          return;
        }
      }

      // Local storage fallback
      const localTrip: SavedTrip = {
        id: Date.now(),
        userId: 1,
        title: payload.title,
        origin: payload.origin,
        destination: payload.destination,
        notes: payload.notes,
        createdAt: new Date().toISOString(),
      };
      const updated = [localTrip, ...trips];
      setTrips(updated);
      localStorage.setItem('transitmate_saved_trips', JSON.stringify(updated));
      setShowAddForm(false);
      setNewTitle('');
      setNewOrigin('');
      setNewDestination('');
    } catch (err) {
      console.error('Failed to create trip:', err);
    }
  };

  const handleUpdateTrip = async (id: number) => {
    try {
      const token = user ? await user.getIdToken() : null;
      if (token) {
        await fetch(`/api/saved-trips/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title: editTitle, notes: editNotes }),
        });
      }

      const updated = trips.map(t => (t.id === id ? { ...t, title: editTitle, notes: editNotes } : t));
      setTrips(updated);
      localStorage.setItem('transitmate_saved_trips', JSON.stringify(updated));
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update trip:', err);
    }
  };

  const handleDeleteTrip = async (id: number) => {
    try {
      const token = user ? await user.getIdToken() : null;
      if (token) {
        await fetch(`/api/saved-trips/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const updated = trips.filter(t => t.id !== id);
      setTrips(updated);
      localStorage.setItem('transitmate_saved_trips', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to delete trip:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Saved Trips
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Your frequent commutes, work routes, and quick access travel shortcuts.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="self-start sm:self-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Saved Trip</span>
          </button>
        </div>

        {/* Add Form Card */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-3xl border border-blue-200 shadow-md animate-in fade-in space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Add Frequent Journey</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTrip} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Trip Nickname (e.g. Home → Office)
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Morning Commute"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Origin Station
                  </label>
                  <input
                    type="text"
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    placeholder="e.g. Central Transit Hub"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Destination Station
                  </label>
                  <input
                    type="text"
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    placeholder="e.g. Marina Bay Station"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
                >
                  Save Journey
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Trips List */}
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Loading saved trips...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No saved journeys yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Plan a route in the Journey Planner and click "Save Trip" to keep your frequent daily commutes ready for instant planning.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trips.map((trip) => {
              const isEditing = editingId === trip.id;

              return (
                <div
                  key={trip.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    {isEditing ? (
                      <div className="space-y-2 mb-3">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
                        />
                        <input
                          type="text"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Optional notes"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600"
                        />
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleUpdateTrip(trip.id)}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                            Saved Journey
                          </span>
                          <h3 className="text-base font-bold text-slate-900 mt-1">
                            {trip.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingId(trip.id);
                              setEditTitle(trip.title);
                              setEditNotes(trip.notes || '');
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Rename or edit trip"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTrip(trip.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete saved trip"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Route Stops path */}
                    <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-700">
                        <span className="w-2 h-2 rounded-full border border-blue-600 bg-white shrink-0" />
                        <span className="font-semibold truncate">{trip.origin}</span>
                      </div>
                      <div className="pl-1 text-slate-300">↓</div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                        <span className="font-semibold truncate">{trip.destination}</span>
                      </div>
                      {trip.notes && (
                        <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                          {trip.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Plan Again Button */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      1-click route refresh
                    </span>
                    <button
                      onClick={() => onPlanTrip(trip.origin, trip.destination)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Plan Again</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
