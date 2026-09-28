import { relations } from 'drizzle-orm';
import { boolean, doublePrecision, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table linked to Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  preferredTransport: text('preferred_transport').default('all'),
  accessibilityNeeds: text('accessibility_needs').default('none'),
  notificationsEnabled: boolean('notifications_enabled').default(true),
  role: text('role').default('user'), // 'admin' | 'user'
  createdAt: timestamp('created_at').defaultNow(),
});

// Transport Routes
export const routes = pgTable('routes', {
  id: serial('id').primaryKey(),
  routeNumber: text('route_number').notNull(), // e.g., '216', 'Blue Line', 'Train 101'
  name: text('name').notNull(), // 'City Center - University'
  type: text('type').notNull(), // 'bus' | 'metro' | 'train'
  color: text('color').default('#2563EB'),
  status: text('status').default('normal'), // 'normal' | 'delay' | 'disruption'
  frequencyMinutes: integer('frequency_minutes').default(10),
  baseFare: integer('base_fare').default(20),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Stops and Stations
export const stops = pgTable('stops', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code'),
  type: text('type').notNull(), // 'bus' | 'metro' | 'train' | 'hub'
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  accessible: boolean('accessible').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Vehicles
export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  routeId: integer('route_id').references(() => routes.id),
  vehicleNumber: text('vehicle_number').notNull(),
  type: text('type').notNull(),
  currentStatus: text('current_status').default('in_service'),
  lastLocationLat: doublePrecision('last_location_lat'),
  lastLocationLng: doublePrecision('last_location_lng'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Schedules
export const schedules = pgTable('schedules', {
  id: serial('id').primaryKey(),
  routeId: integer('route_id').references(() => routes.id).notNull(),
  stopId: integer('stop_id').references(() => stops.id).notNull(),
  stopSequence: integer('stop_sequence').notNull(),
  departureTime: text('departure_time').notNull(), // "HH:MM"
  dayType: text('day_type').default('all'),
});

// Fares
export const fares = pgTable('fares', {
  id: serial('id').primaryKey(),
  fromStopId: integer('from_stop_id').references(() => stops.id),
  toStopId: integer('to_stop_id').references(() => stops.id),
  routeId: integer('route_id').references(() => routes.id),
  fare: integer('fare').notNull(),
  transportType: text('transport_type').notNull(),
});

// Saved Trips
export const savedTrips = pgTable('saved_trips', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  origin: text('origin').notNull(),
  originLat: doublePrecision('origin_lat'),
  originLng: doublePrecision('origin_lng'),
  destination: text('destination').notNull(),
  destinationLat: doublePrecision('destination_lat'),
  destinationLng: doublePrecision('destination_lng'),
  preferredTransport: text('preferred_transport').default('all'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Service Alerts
export const alerts = pgTable('alerts', {
  id: serial('id').primaryKey(),
  routeId: integer('route_id').references(() => routes.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  severity: text('severity').notNull(), // 'normal' | 'delay' | 'disruption'
  transportType: text('transport_type').notNull(), // 'bus' | 'metro' | 'train' | 'all'
  active: boolean('active').default(true),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Problem Reports
export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  reportId: text('report_id').notNull().unique(),
  userId: integer('user_id').references(() => users.id),
  userEmail: text('user_email'),
  transportType: text('transport_type').notNull(),
  route: text('route').notNull(),
  location: text('location').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  status: text('status').default('under_review'), // 'under_review' | 'investigating' | 'resolved'
  createdAt: timestamp('created_at').defaultNow(),
});

// User Notifications
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').default('alert'),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  savedTrips: many(savedTrips),
  reports: many(reports),
  notifications: many(notifications),
}));

export const routesRelations = relations(routes, ({ many }) => ({
  vehicles: many(vehicles),
  schedules: many(schedules),
  fares: many(fares),
  alerts: many(alerts),
}));

export const stopsRelations = relations(stops, ({ many }) => ({
  schedules: many(schedules),
}));

export const savedTripsRelations = relations(savedTrips, ({ one }) => ({
  user: one(users, {
    fields: [savedTrips.userId],
    references: [users.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
