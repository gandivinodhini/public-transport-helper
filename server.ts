import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { requireAuth, optionalAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser, getUserByUid, updateUserProfile } from './src/db/users.ts';
import {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
  getAllStops,
  getStopById,
  createStop,
  updateStop,
  deleteStop,
  getSchedulesByRoute,
  getAllVehicles,
  getActiveAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
  getSavedTripsForUser,
  createSavedTrip,
  updateSavedTrip,
  deleteSavedTrip,
  getAllReports,
  getReportsForUser,
  createReport,
  updateReportStatus,
  getNotificationsForUser,
  markNotificationAsRead,
  getAdminAnalytics,
} from './src/db/transit.ts';
import { findJourneys } from './src/services/journeyPlanner.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Helper to get authenticated database user
async function getDbUserFromAuth(req: AuthRequest) {
  if (!req.user || !req.user.uid) return null;
  return await getOrCreateUser(req.user.uid, req.user.email || 'user@transitmate.app', req.user.name);
}

// ----------------------------------------------------
// AUTH & USER ROUTES
// ----------------------------------------------------
app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await getDbUserFromAuth(req);
    res.json({ success: true, user });
  } catch (error: any) {
    console.error('Error in /api/auth/sync:', error);
    res.status(500).json({ error: error.message || 'Failed to sync user' });
  }
});

app.get('/api/user/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await getDbUserFromAuth(req);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch profile' });
  }
});

app.put('/api/user/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await getDbUserFromAuth(req);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { displayName, preferredTransport, accessibilityNeeds, notificationsEnabled } = req.body;
    const updated = await updateUserProfile(user.uid, {
      displayName: displayName ?? user.displayName,
      preferredTransport: preferredTransport ?? user.preferredTransport,
      accessibilityNeeds: accessibilityNeeds ?? user.accessibilityNeeds,
      notificationsEnabled: notificationsEnabled !== undefined ? Boolean(notificationsEnabled) : user.notificationsEnabled,
    });
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: error.message || 'Failed to update profile' });
  }
});

// ----------------------------------------------------
// ROUTES & SCHEDULES
// ----------------------------------------------------
app.get('/api/routes', async (_req: Request, res: Response) => {
  try {
    const routesList = await getAllRoutes();
    res.json(routesList);
  } catch (error: any) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch routes' });
  }
});

app.get('/api/routes/:id', async (req: Request, res: Response) => {
  try {
    const routeId = parseInt(req.params.id, 10);
    const route = await getRouteById(routeId);
    if (!route) return res.status(404).json({ error: 'Route not found' });

    const schedulesList = await getSchedulesByRoute(routeId);
    res.json({ ...route, schedules: schedulesList });
  } catch (error: any) {
    console.error(`Error fetching route ${req.params.id}:`, error);
    res.status(500).json({ error: error.message || 'Failed to fetch route' });
  }
});

app.post('/api/routes', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { routeNumber, name, type, color, status, frequencyMinutes, baseFare, description } = req.body;
    const newRoute = await createRoute({
      routeNumber,
      name,
      type,
      color: color || '#2563EB',
      status: status || 'normal',
      frequencyMinutes: frequencyMinutes ? parseInt(frequencyMinutes, 10) : 10,
      baseFare: baseFare ? parseInt(baseFare, 10) : 20,
      description,
    });
    res.status(201).json(newRoute);
  } catch (error: any) {
    console.error('Error creating route:', error);
    res.status(500).json({ error: error.message || 'Failed to create route' });
  }
});

app.put('/api/routes/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const routeId = parseInt(req.params.id, 10);
    const updated = await updateRoute(routeId, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating route:', error);
    res.status(500).json({ error: error.message || 'Failed to update route' });
  }
});

app.delete('/api/routes/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const routeId = parseInt(req.params.id, 10);
    const deleted = await deleteRoute(routeId);
    res.json({ success: true, deleted });
  } catch (error: any) {
    console.error('Error deleting route:', error);
    res.status(500).json({ error: error.message || 'Failed to delete route' });
  }
});

// ----------------------------------------------------
// STOPS & NEARBY
// ----------------------------------------------------
app.get('/api/stops', async (_req: Request, res: Response) => {
  try {
    const stopsList = await getAllStops();
    res.json(stopsList);
  } catch (error: any) {
    console.error('Error fetching stops:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch stops' });
  }
});

app.get('/api/stops/nearby', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 1.2834;
    const lng = parseFloat(req.query.lng as string) || 103.8505;
    const typeFilter = (req.query.type as string) || 'all';

    const allStops = await getAllStops();
    const allRoutes = await getAllRoutes();

    // Calculate distance for all stops
    const withDistance = allStops.map(stop => {
      const R = 6371e3;
      const phi1 = (lat * Math.PI) / 180;
      const phi2 = (stop.latitude * Math.PI) / 180;
      const deltaPhi = ((stop.latitude - lat) * Math.PI) / 180;
      const deltaLon = ((stop.longitude - lng) * Math.PI) / 180;
      const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceMeters = Math.round(R * c);
      const walkingMinutes = Math.max(1, Math.round(distanceMeters / 80));

      // Available routes at this stop
      const routesPassing = allRoutes
        .filter(r => (stop.type === 'hub' || r.type === stop.type || (stop.type === 'metro' && r.type === 'metro')))
        .slice(0, 3)
        .map(r => ({
          routeNumber: r.routeNumber,
          name: r.name,
          color: r.color,
          type: r.type,
          status: r.status,
          nextDepartureInMinutes: Math.floor(Math.random() * (r.frequencyMinutes || 10)) + 2,
        }));

      return {
        ...stop,
        distanceMeters,
        walkingMinutes,
        availableRoutes: routesPassing,
      };
    });

    let filtered = withDistance;
    if (typeFilter !== 'all') {
      filtered = filtered.filter(s => s.type === typeFilter || (s.type === 'hub' && typeFilter !== 'bus'));
    }

    filtered.sort((a, b) => a.distanceMeters - b.distanceMeters);
    res.json(filtered.slice(0, 10));
  } catch (error: any) {
    console.error('Error fetching nearby stops:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch nearby transport' });
  }
});

app.post('/api/stops', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, type, latitude, longitude, accessible } = req.body;
    const newStop = await createStop({
      name,
      code,
      type,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      accessible: accessible !== false,
    });
    res.status(201).json(newStop);
  } catch (error: any) {
    console.error('Error creating stop:', error);
    res.status(500).json({ error: error.message || 'Failed to create stop' });
  }
});

app.put('/api/stops/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const stopId = parseInt(req.params.id, 10);
    const updated = await updateStop(stopId, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating stop:', error);
    res.status(500).json({ error: error.message || 'Failed to update stop' });
  }
});

app.delete('/api/stops/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const stopId = parseInt(req.params.id, 10);
    const deleted = await deleteStop(stopId);
    res.json({ success: true, deleted });
  } catch (error: any) {
    console.error('Error deleting stop:', error);
    res.status(500).json({ error: error.message || 'Failed to delete stop' });
  }
});

// ----------------------------------------------------
// JOURNEY PLANNER
// ----------------------------------------------------
app.post('/api/journey/plan', async (req: Request, res: Response) => {
  try {
    const { origin, destination, departureTime, date, transportPreference, accessibleOnly } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and Destination are required.' });
    }

    const options = await findJourneys({
      origin,
      destination,
      departureTime,
      date,
      transportPreference,
      accessibleOnly: Boolean(accessibleOnly),
    });

    res.json({
      query: { origin, destination, departureTime, date, transportPreference },
      timestamp: new Date().toISOString(),
      options,
    });
  } catch (error: any) {
    console.error('Error in journey planning:', error);
    res.status(500).json({ error: error.message || 'Failed to plan journey' });
  }
});

// ----------------------------------------------------
// LIVE VEHICLES
// ----------------------------------------------------
app.get('/api/vehicles', async (_req: Request, res: Response) => {
  try {
    const vehiclesList = await getAllVehicles();
    res.json(vehiclesList);
  } catch (error: any) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch vehicles' });
  }
});

// ----------------------------------------------------
// ALERTS
// ----------------------------------------------------
app.get('/api/alerts', async (req: Request, res: Response) => {
  try {
    const type = req.query.type as string;
    const alertsList = await getActiveAlerts(type);
    res.json(alertsList);
  } catch (error: any) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch alerts' });
  }
});

app.post('/api/alerts', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { routeId, title, description, severity, transportType } = req.body;
    const newAlert = await createAlert({
      routeId: routeId ? parseInt(routeId, 10) : null,
      title,
      description,
      severity: severity || 'normal',
      transportType: transportType || 'all',
      active: true,
    });
    res.status(201).json(newAlert);
  } catch (error: any) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: error.message || 'Failed to create alert' });
  }
});

app.put('/api/alerts/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const alertId = parseInt(req.params.id, 10);
    const updated = await updateAlert(alertId, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating alert:', error);
    res.status(500).json({ error: error.message || 'Failed to update alert' });
  }
});

app.delete('/api/alerts/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const alertId = parseInt(req.params.id, 10);
    const deleted = await deleteAlert(alertId);
    res.json({ success: true, deleted });
  } catch (error: any) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ error: error.message || 'Failed to delete alert' });
  }
});

// ----------------------------------------------------
// SAVED TRIPS
// ----------------------------------------------------
app.get('/api/saved-trips', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await getDbUserFromAuth(req);
    if (!user) return res.status(401).json({ error: 'User authentication required' });

    const trips = await getSavedTripsForUser(user.id);
    res.json(trips);
  } catch (error: any) {
    console.error('Error fetching saved trips:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch saved trips' });
  }
});

app.post('/api/saved-trips', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await getDbUserFromAuth(req);
    if (!user) return res.status(401).json({ error: 'User authentication required' });

    const { title, origin, destination, preferredTransport, notes } = req.body;
    const newTrip = await createSavedTrip({
      userId: user.id,
      title: title || `${origin} → ${destination}`,
      origin,
      destination,
      preferredTransport: preferredTransport || 'all',
      notes: notes || '',
    });
    res.status(201).json(newTrip);
  } catch (error: any) {
    console.error('Error saving trip:', error);
    res.status(500).json({ error: error.message || 'Failed to save trip' });
  }
});

app.put('/api/saved-trips/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await getDbUserFromAuth(req);
    if (!user) return res.status(401).json({ error: 'User authentication required' });

    const tripId = parseInt(req.params.id, 10);
    const updated = await updateSavedTrip(tripId, user.id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating saved trip:', error);
    res.status(500).json({ error: error.message || 'Failed to update saved trip' });
  }
});

app.delete('/api/saved-trips/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await getDbUserFromAuth(req);
    if (!user) return res.status(401).json({ error: 'User authentication required' });

    const tripId = parseInt(req.params.id, 10);
    const deleted = await deleteSavedTrip(tripId, user.id);
    res.json({ success: true, deleted });
  } catch (error: any) {
    console.error('Error deleting saved trip:', error);
    res.status(500).json({ error: error.message || 'Failed to delete saved trip' });
  }
});

// ----------------------------------------------------
// REPORTS (Report a Problem)
// ----------------------------------------------------
app.get('/api/reports', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await getDbUserFromAuth(req);
    if (user && user.role === 'admin') {
      const all = await getAllReports();
      return res.json(all);
    } else if (user) {
      const userReports = await getReportsForUser(user.id);
      return res.json(userReports);
    }
    res.json([]);
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch reports' });
  }
});

app.post('/api/reports', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await getDbUserFromAuth(req);
    const { transportType, route, location, category, description, userEmail } = req.body;

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const reportId = `TM-${randomSuffix}`;

    const report = await createReport({
      reportId,
      userId: user ? user.id : null,
      userEmail: user ? user.email : userEmail || 'anonymous@transitmate.app',
      transportType: transportType || 'bus',
      route: route || 'General',
      location: location || 'Not specified',
      category: category || 'other',
      description,
      status: 'under_review',
    });

    res.status(201).json({
      success: true,
      reportId: report.reportId,
      status: report.status,
      report,
    });
  } catch (error: any) {
    console.error('Error submitting report:', error);
    res.status(500).json({ error: error.message || 'Failed to submit report' });
  }
});

app.patch('/api/reports/:id/status', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const reportId = parseInt(req.params.id, 10);
    const { status } = req.body;
    const updated = await updateReportStatus(reportId, status);
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating report status:', error);
    res.status(500).json({ error: error.message || 'Failed to update report' });
  }
});

// ----------------------------------------------------
// NOTIFICATIONS
// ----------------------------------------------------
app.get('/api/notifications', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await getDbUserFromAuth(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    let notifs = await getNotificationsForUser(user.id);
    if (notifs.length === 0) {
      // Seed two personalized helpful notifications
      notifs = [
        {
          id: 1,
          userId: user.id,
          title: 'Welcome to TransitMate',
          message: 'Plan journeys, save frequent trips, and receive real-time disruption alerts.',
          type: 'info',
          read: false,
          createdAt: new Date(),
        },
        {
          id: 2,
          userId: user.id,
          title: 'Metro Blue Line Maintenance',
          message: 'Minor 4-6 min signal delays reported around Orchard Boulevard.',
          type: 'delay',
          read: false,
          createdAt: new Date(),
        }
      ] as any;
    }
    res.json(notifs);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch notifications' });
  }
});

app.patch('/api/notifications/:id/read', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await getDbUserFromAuth(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const notifId = parseInt(req.params.id, 10);
    const updated = await markNotificationAsRead(notifId, user.id);
    res.json(updated || { id: notifId, read: true });
  } catch (error: any) {
    console.error('Error marking notification read:', error);
    res.status(500).json({ error: error.message || 'Failed to update notification' });
  }
});

// ----------------------------------------------------
// ADMIN ANALYTICS
// ----------------------------------------------------
app.get('/api/admin/analytics', async (_req: Request, res: Response) => {
  try {
    const stats = await getAdminAnalytics();
    res.json(stats);
  } catch (error: any) {
    console.error('Error fetching admin analytics:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch analytics' });
  }
});

// ----------------------------------------------------
// SERVER START & VITE MIDDLEWARE
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`TransitMate server listening on port ${PORT}`);
  });
}

startServer();
