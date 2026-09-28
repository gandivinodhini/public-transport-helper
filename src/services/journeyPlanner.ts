import { getAllRoutes, getAllStops } from '../db/transit.ts';

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
  coordinates: [number, number][]; // [lat, lng] array
}

export interface RouteOption {
  id: string;
  title: string;
  summaryTransport: string; // e.g., "Bus 216 → Metro Blue Line"
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

// Helper to calculate approximate distance in meters
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function addMinutes(timeStr: string, minutesToAdd: number): string {
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr || '8', 10);
  let m = parseInt(mStr || '0', 10);
  m += minutesToAdd;
  h = (h + Math.floor(m / 60)) % 24;
  m = m % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export async function findJourneys(params: {
  origin: string;
  destination: string;
  departureTime?: string;
  date?: string;
  transportPreference?: string;
  accessibleOnly?: boolean;
}): Promise<RouteOption[]> {
  const allStops = await getAllStops();
  const allRoutes = await getAllRoutes();

  const depTime = params.departureTime || '08:15';
  const pref = params.transportPreference || 'all';

  // Find best matching origin stop
  const originQuery = params.origin.toLowerCase();
  const destQuery = params.destination.toLowerCase();

  let startStop = allStops.find(s => s.name.toLowerCase().includes(originQuery) || originQuery.includes(s.name.toLowerCase()));
  if (!startStop) {
    startStop = allStops[0]; // fallback
  }

  let endStop = allStops.find(s => s.name.toLowerCase().includes(destQuery) || destQuery.includes(s.name.toLowerCase()));
  if (!endStop || endStop.id === startStop.id) {
    endStop = allStops.find(s => s.id !== startStop!.id) || allStops[1];
  }

  // Intermediate candidate stops
  const intermediateStop1 = allStops.find(s => s.id === 1) || allStops[0]; // Central Hub
  const intermediateStop2 = allStops.find(s => s.id === 5) || allStops[2]; // Orchard

  // Generate 4 distinct realistic options
  const options: RouteOption[] = [];

  // OPTION 1: Fastest (Multi-modal or direct express)
  {
    const step1WalkMin = 5;
    const step1Dist = 350;
    const step2RideMin = 14;
    const step3TransferMin = 4;
    const step4RideMin = 12;
    const step5WalkMin = 4;
    const step5Dist = 280;
    const totalMin = step1WalkMin + step2RideMin + step3TransferMin + step4RideMin + step5WalkMin;

    const t0 = depTime;
    const t1 = addMinutes(t0, step1WalkMin);
    const t2 = addMinutes(t1, step2RideMin);
    const t3 = addMinutes(t2, step3TransferMin);
    const t4 = addMinutes(t3, step4RideMin);
    const t5 = addMinutes(t4, step5WalkMin);

    const steps: JourneyStep[] = [
      {
        id: 'opt1-s1',
        type: 'walk',
        instruction: `Walk to ${startStop.name}`,
        detail: `Head toward ${startStop.name} entrance. Well-lit sidewalk.`,
        timeString: t0,
        durationMinutes: step1WalkMin,
        distanceMeters: step1Dist,
        coordinates: [
          [startStop.latitude - 0.002, startStop.longitude - 0.001],
          [startStop.latitude, startStop.longitude]
        ]
      },
      {
        id: 'opt1-s2',
        type: 'bus',
        instruction: 'Board Bus 216',
        detail: `Platform A • Towards City Central • 4 stops`,
        timeString: t1,
        durationMinutes: step2RideMin,
        distanceMeters: 3800,
        fromStopName: startStop.name,
        toStopName: intermediateStop1.name,
        routeNumber: 'Bus 216',
        routeColor: '#2563EB',
        stopsCount: 4,
        stopsList: [startStop.name, 'Downtown Plaza', 'City Center Terminal', intermediateStop1.name],
        coordinates: [
          [startStop.latitude, startStop.longitude],
          [intermediateStop1.latitude + 0.005, intermediateStop1.longitude - 0.003],
          [intermediateStop1.latitude, intermediateStop1.longitude]
        ]
      },
      {
        id: 'opt1-s3',
        type: 'transfer',
        instruction: `Transfer at ${intermediateStop1.name}`,
        detail: `Follow overhead signage to Metro Concourse (Level B2). Step-free elevators available.`,
        timeString: t2,
        durationMinutes: step3TransferMin,
        distanceMeters: 180,
        coordinates: [
          [intermediateStop1.latitude, intermediateStop1.longitude],
          [intermediateStop1.latitude + 0.0005, intermediateStop1.longitude + 0.0005]
        ]
      },
      {
        id: 'opt1-s4',
        type: 'metro',
        instruction: 'Board Metro Blue Line',
        detail: `Platform 2 • Direction Northbound • 3 stations`,
        timeString: t3,
        durationMinutes: step4RideMin,
        distanceMeters: 5200,
        fromStopName: intermediateStop1.name,
        toStopName: endStop.name,
        routeNumber: 'Metro Blue Line',
        routeColor: '#0284C7',
        stopsCount: 3,
        stopsList: [intermediateStop1.name, 'Orchard Boulevard', endStop.name],
        coordinates: [
          [intermediateStop1.latitude, intermediateStop1.longitude],
          [intermediateStop2.latitude, intermediateStop2.longitude],
          [endStop.latitude, endStop.longitude]
        ]
      },
      {
        id: 'opt1-s5',
        type: 'walk',
        instruction: `Walk to ${params.destination}`,
        detail: `Exit Station via Gate 2 to destination.`,
        timeString: t4,
        durationMinutes: step5WalkMin,
        distanceMeters: step5Dist,
        coordinates: [
          [endStop.latitude, endStop.longitude],
          [endStop.latitude + 0.0015, endStop.longitude + 0.002]
        ]
      }
    ];

    const allCoords = steps.flatMap(s => s.coordinates);

    options.push({
      id: 'route-fastest',
      title: 'Route 1 — Fastest',
      summaryTransport: 'Bus 216 → Metro Blue Line',
      badge: 'Fastest',
      departureTime: t0,
      arrivalTime: t5,
      totalDurationMinutes: totalMin,
      fare: 28,
      transfersCount: 1,
      walkingDistanceMeters: step1Dist + step5Dist,
      walkingDurationMinutes: step1WalkMin + step5WalkMin,
      transportTypes: ['bus', 'metro'],
      departureStop: startStop.name,
      arrivalStop: endStop.name,
      carbonSavedKg: 1.4,
      isAccessible: true,
      steps,
      allCoordinates: allCoords,
    });
  }

  // OPTION 2: Cheapest (Direct or single bus)
  {
    const step1WalkMin = 7;
    const step1Dist = 480;
    const step2RideMin = 34;
    const step3WalkMin = 4;
    const step3Dist = 260;
    const totalMin = step1WalkMin + step2RideMin + step3WalkMin;

    const t0 = depTime;
    const t1 = addMinutes(t0, step1WalkMin);
    const t2 = addMinutes(t1, step2RideMin);
    const t3 = addMinutes(t2, step3WalkMin);

    const steps: JourneyStep[] = [
      {
        id: 'opt2-s1',
        type: 'walk',
        instruction: `Walk to ${startStop.name}`,
        detail: `Head east along main avenue.`,
        timeString: t0,
        durationMinutes: step1WalkMin,
        distanceMeters: step1Dist,
        coordinates: [
          [startStop.latitude - 0.003, startStop.longitude],
          [startStop.latitude, startStop.longitude]
        ]
      },
      {
        id: 'opt2-s2',
        type: 'bus',
        instruction: 'Board Bus 42',
        detail: `Direct single-fare ride • 8 stops`,
        timeString: t1,
        durationMinutes: step2RideMin,
        distanceMeters: 7400,
        fromStopName: startStop.name,
        toStopName: endStop.name,
        routeNumber: 'Bus 42',
        routeColor: '#F59E0B',
        stopsCount: 8,
        stopsList: [startStop.name, 'Riverside Promenade', 'Central Transit Hub', 'Orchard Boulevard', endStop.name],
        coordinates: [
          [startStop.latitude, startStop.longitude],
          [intermediateStop1.latitude, intermediateStop1.longitude],
          [endStop.latitude, endStop.longitude]
        ]
      },
      {
        id: 'opt2-s3',
        type: 'walk',
        instruction: `Walk to ${params.destination}`,
        detail: `Short stroll to final destination.`,
        timeString: t2,
        durationMinutes: step3WalkMin,
        distanceMeters: step3Dist,
        coordinates: [
          [endStop.latitude, endStop.longitude],
          [endStop.latitude + 0.001, endStop.longitude + 0.001]
        ]
      }
    ];

    options.push({
      id: 'route-cheapest',
      title: 'Route 2 — Cheapest & Direct',
      summaryTransport: 'Bus 42 (No Transfer)',
      badge: 'Cheapest',
      departureTime: t0,
      arrivalTime: t3,
      totalDurationMinutes: totalMin,
      fare: 15,
      transfersCount: 0,
      walkingDistanceMeters: step1Dist + step3Dist,
      walkingDurationMinutes: step1WalkMin + step3WalkMin,
      transportTypes: ['bus'],
      departureStop: startStop.name,
      arrivalStop: endStop.name,
      carbonSavedKg: 1.2,
      isAccessible: true,
      steps,
      allCoordinates: steps.flatMap(s => s.coordinates),
    });
  }

  // OPTION 3: Fewest Transfers / Metro Direct
  {
    const step1WalkMin = 8;
    const step1Dist = 580;
    const step2RideMin = 22;
    const step3WalkMin = 5;
    const step3Dist = 340;
    const totalMin = step1WalkMin + step2RideMin + step3WalkMin;

    const t0 = depTime;
    const t1 = addMinutes(t0, step1WalkMin);
    const t2 = addMinutes(t1, step2RideMin);
    const t3 = addMinutes(t2, step3WalkMin);

    const steps: JourneyStep[] = [
      {
        id: 'opt3-s1',
        type: 'walk',
        instruction: `Walk to ${intermediateStop1.name}`,
        detail: `Use pedestrian skyway to station entrance.`,
        timeString: t0,
        durationMinutes: step1WalkMin,
        distanceMeters: step1Dist,
        coordinates: [
          [intermediateStop1.latitude - 0.004, intermediateStop1.longitude - 0.002],
          [intermediateStop1.latitude, intermediateStop1.longitude]
        ]
      },
      {
        id: 'opt3-s2',
        type: 'metro',
        instruction: 'Board Metro Green Line',
        detail: `Express underground direct route • 5 stops`,
        timeString: t1,
        durationMinutes: step2RideMin,
        distanceMeters: 8100,
        fromStopName: intermediateStop1.name,
        toStopName: endStop.name,
        routeNumber: 'Metro Green Line',
        routeColor: '#16A34A',
        stopsCount: 5,
        stopsList: [intermediateStop1.name, 'Downtown Plaza', 'Marina Bay Station', endStop.name],
        coordinates: [
          [intermediateStop1.latitude, intermediateStop1.longitude],
          [intermediateStop2.latitude + 0.002, intermediateStop2.longitude + 0.002],
          [endStop.latitude, endStop.longitude]
        ]
      },
      {
        id: 'opt3-s3',
        type: 'walk',
        instruction: `Walk to ${params.destination}`,
        detail: `Arrive at destination gate.`,
        timeString: t2,
        durationMinutes: step3WalkMin,
        distanceMeters: step3Dist,
        coordinates: [
          [endStop.latitude, endStop.longitude],
          [endStop.latitude + 0.002, endStop.longitude + 0.001]
        ]
      }
    ];

    options.push({
      id: 'route-fewest-transfers',
      title: 'Route 3 — Fewest Transfers',
      summaryTransport: 'Metro Green Line',
      badge: 'Fewest Transfers',
      departureTime: t0,
      arrivalTime: t3,
      totalDurationMinutes: totalMin,
      fare: 25,
      transfersCount: 0,
      walkingDistanceMeters: step1Dist + step3Dist,
      walkingDurationMinutes: step1WalkMin + step3WalkMin,
      transportTypes: ['metro'],
      departureStop: intermediateStop1.name,
      arrivalStop: endStop.name,
      carbonSavedKg: 1.7,
      isAccessible: true,
      steps,
      allCoordinates: steps.flatMap(s => s.coordinates),
    });
  }

  // OPTION 4: Least Walking (Door-to-door shuttle + commuter train)
  {
    const step1WalkMin = 2;
    const step1Dist = 120;
    const step2RideMin = 10;
    const step3TransferMin = 3;
    const step4RideMin = 18;
    const step5WalkMin = 2;
    const step5Dist = 140;
    const totalMin = step1WalkMin + step2RideMin + step3TransferMin + step4RideMin + step5WalkMin;

    const t0 = depTime;
    const t1 = addMinutes(t0, step1WalkMin);
    const t2 = addMinutes(t1, step2RideMin);
    const t3 = addMinutes(t2, step3TransferMin);
    const t4 = addMinutes(t3, step4RideMin);
    const t5 = addMinutes(t4, step5WalkMin);

    const steps: JourneyStep[] = [
      {
        id: 'opt4-s1',
        type: 'walk',
        instruction: `Step out to nearby stop`,
        detail: `Only 120 meters walk directly outside door.`,
        timeString: t0,
        durationMinutes: step1WalkMin,
        distanceMeters: step1Dist,
        coordinates: [
          [startStop.latitude - 0.0008, startStop.longitude - 0.0008],
          [startStop.latitude, startStop.longitude]
        ]
      },
      {
        id: 'opt4-s2',
        type: 'bus',
        instruction: 'Board Bus 216 Shuttle',
        detail: `Direct stop connection`,
        timeString: t1,
        durationMinutes: step2RideMin,
        distanceMeters: 2200,
        fromStopName: startStop.name,
        toStopName: intermediateStop1.name,
        routeNumber: 'Bus 216',
        routeColor: '#2563EB',
        stopsCount: 2,
        stopsList: [startStop.name, intermediateStop1.name],
        coordinates: [
          [startStop.latitude, startStop.longitude],
          [intermediateStop1.latitude, intermediateStop1.longitude]
        ]
      },
      {
        id: 'opt4-s3',
        type: 'transfer',
        instruction: `Cross platform at ${intermediateStop1.name}`,
        detail: `Cross-platform transfer under 3 minutes with zero stairs.`,
        timeString: t2,
        durationMinutes: step3TransferMin,
        distanceMeters: 60,
        coordinates: [
          [intermediateStop1.latitude, intermediateStop1.longitude],
          [intermediateStop1.latitude + 0.0003, intermediateStop1.longitude + 0.0003]
        ]
      },
      {
        id: 'opt4-s4',
        type: 'train',
        instruction: 'Board Express Train 101',
        detail: `Platform 1 • Express Commuter Train • 2 stops`,
        timeString: t3,
        durationMinutes: step4RideMin,
        distanceMeters: 6700,
        fromStopName: intermediateStop1.name,
        toStopName: endStop.name,
        routeNumber: 'Express Train 101',
        routeColor: '#DC2626',
        stopsCount: 2,
        stopsList: [intermediateStop1.name, endStop.name],
        coordinates: [
          [intermediateStop1.latitude, intermediateStop1.longitude],
          [endStop.latitude, endStop.longitude]
        ]
      },
      {
        id: 'opt4-s5',
        type: 'walk',
        instruction: `Walk to ${params.destination}`,
        detail: `Direct covered walkway into destination lobby.`,
        timeString: t4,
        durationMinutes: step5WalkMin,
        distanceMeters: step5Dist,
        coordinates: [
          [endStop.latitude, endStop.longitude],
          [endStop.latitude + 0.0008, endStop.longitude + 0.0005]
        ]
      }
    ];

    options.push({
      id: 'route-least-walking',
      title: 'Route 4 — Least Walking',
      summaryTransport: 'Bus 216 → Express Train 101',
      badge: 'Least Walking',
      departureTime: t0,
      arrivalTime: t5,
      totalDurationMinutes: totalMin,
      fare: 35,
      transfersCount: 1,
      walkingDistanceMeters: step1Dist + step5Dist,
      walkingDurationMinutes: step1WalkMin + step5WalkMin,
      transportTypes: ['bus', 'train'],
      departureStop: startStop.name,
      arrivalStop: endStop.name,
      carbonSavedKg: 1.8,
      isAccessible: true,
      steps,
      allCoordinates: steps.flatMap(s => s.coordinates),
    });
  }

  // Filter based on preferences if needed
  if (pref !== 'all') {
    const filtered = options.filter(opt => opt.transportTypes.includes(pref as any));
    if (filtered.length > 0) return filtered;
  }

  return options;
}
