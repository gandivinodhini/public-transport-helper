export interface TransitRoute {
  id: number;
  routeNumber: string;
  name: string;
  type: 'bus' | 'metro' | 'train';
  color: string;
  status: 'normal' | 'delay' | 'disruption';
  frequencyMinutes: number;
  baseFare: number;
  description?: string;
}

export interface TransitStop {
  id: number;
  name: string;
  code?: string;
  type: 'bus' | 'metro' | 'train' | 'hub';
  latitude: number;
  longitude: number;
  accessible: boolean;
  distanceMeters?: number;
  walkingMinutes?: number;
  availableRoutes?: {
    routeNumber: string;
    name: string;
    color: string;
    type: string;
    status: string;
    nextDepartureInMinutes: number;
  }[];
}

export interface ServiceAlert {
  id: number;
  routeId?: number | null;
  title: string;
  description: string;
  severity: 'normal' | 'delay' | 'disruption';
  transportType: 'bus' | 'metro' | 'train' | 'all';
  active: boolean;
  updatedAt: string;
  routeName?: string;
  routeNumber?: string;
}

export interface SavedTrip {
  id: number;
  userId: number;
  title: string;
  origin: string;
  destination: string;
  preferredTransport?: string;
  notes?: string;
  createdAt: string;
}

export interface ProblemReport {
  id: number;
  reportId: string;
  userId?: number | null;
  userEmail?: string;
  transportType: string;
  route: string;
  location: string;
  category: 'delay' | 'wrong_information' | 'missing_stop' | 'broken_infrastructure' | 'accessibility_issue' | 'other';
  description: string;
  status: 'under_review' | 'investigating' | 'resolved';
  createdAt: string;
}

export interface JourneyStep {
  id: string;
  type: 'walk' | 'bus' | 'metro' | 'train' | 'transfer';
  instruction: string;
  detail: string;
  timeString: string;
  durationMinutes: number;
  distanceMeters: number;
  fromStopName?: string;
  toStopName?: string;
  routeNumber?: string;
  routeColor?: string;
  stopsCount?: number;
  stopsList?: string[];
  coordinates: [number, number][];
}

export interface RouteOption {
  id: string;
  title: string;
  summaryTransport: string;
  badge: 'Fastest' | 'Cheapest' | 'Fewest Transfers' | 'Least Walking' | 'Eco Friendly' | 'Direct';
  departureTime: string;
  arrivalTime: string;
  totalDurationMinutes: number;
  fare: number;
  transfersCount: number;
  walkingDistanceMeters: number;
  walkingDurationMinutes: number;
  transportTypes: ('bus' | 'metro' | 'train' | 'walk')[];
  departureStop: string;
  arrivalStop: string;
  carbonSavedKg: number;
  isAccessible: boolean;
  steps: JourneyStep[];
  allCoordinates: [number, number][];
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: 'alert' | 'delay' | 'disruption' | 'trip' | 'info';
  read: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: number;
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  preferredTransport: string;
  accessibilityNeeds: string;
  notificationsEnabled: boolean;
}
