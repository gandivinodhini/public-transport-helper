import { RouteOption, JourneyStep } from '../types.ts';
import { DEFAULT_STOPS } from '../data/defaultTransitData.ts';

function addMinutes(timeStr: string, minutesToAdd: number): string {
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr || '8', 10);
  let m = parseInt(mStr || '0', 10);
  m += minutesToAdd;
  h = (h + Math.floor(m / 60)) % 24;
  m = m % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function computeClientJourneys(params: {
  origin: string;
  destination: string;
  departureTime?: string;
  transportPreference?: string;
}): RouteOption[] {
  const depTime = params.departureTime || '08:30';
  const orig = params.origin || 'Central Transit Hub';
  const dest = params.destination || 'University Station';

  const startStop = DEFAULT_STOPS.find(s => s.name.toLowerCase().includes(orig.toLowerCase())) || DEFAULT_STOPS[0];
  const endStop = DEFAULT_STOPS.find(s => s.name.toLowerCase().includes(dest.toLowerCase())) || DEFAULT_STOPS[6];
  const midStop = DEFAULT_STOPS[4]; // Orchard

  const opt1Steps: JourneyStep[] = [
    {
      id: 'opt1-s1',
      type: 'walk',
      instruction: `Walk to ${startStop.name}`,
      detail: 'Sidewalk path to main station entrance',
      timeString: depTime,
      durationMinutes: 5,
      distanceMeters: 350,
      coordinates: [
        [startStop.latitude - 0.002, startStop.longitude - 0.001],
        [startStop.latitude, startStop.longitude]
      ]
    },
    {
      id: 'opt1-s2',
      type: 'bus',
      instruction: 'Board Bus 216',
      detail: `Platform 1 • 4 stops towards Central`,
      timeString: addMinutes(depTime, 5),
      durationMinutes: 14,
      distanceMeters: 3800,
      fromStopName: startStop.name,
      toStopName: midStop.name,
      routeNumber: 'Bus 216',
      routeColor: '#2563EB',
      stopsCount: 4,
      stopsList: [startStop.name, 'Downtown Plaza', 'City Center Terminal', midStop.name],
      coordinates: [
        [startStop.latitude, startStop.longitude],
        [midStop.latitude, midStop.longitude]
      ]
    },
    {
      id: 'opt1-s3',
      type: 'transfer',
      instruction: `Transfer at ${midStop.name}`,
      detail: 'Step-free transfer to Metro Blue Line concourse',
      timeString: addMinutes(depTime, 19),
      durationMinutes: 4,
      distanceMeters: 180,
      coordinates: [
        [midStop.latitude, midStop.longitude],
        [midStop.latitude + 0.0005, midStop.longitude + 0.0005]
      ]
    },
    {
      id: 'opt1-s4',
      type: 'metro',
      instruction: 'Board Metro Blue Line',
      detail: `Platform 2 • Direction University`,
      timeString: addMinutes(depTime, 23),
      durationMinutes: 12,
      distanceMeters: 5200,
      fromStopName: midStop.name,
      toStopName: endStop.name,
      routeNumber: 'Metro Blue Line',
      routeColor: '#0284C7',
      stopsCount: 3,
      stopsList: [midStop.name, 'Orchard Boulevard', endStop.name],
      coordinates: [
        [midStop.latitude, midStop.longitude],
        [endStop.latitude, endStop.longitude]
      ]
    },
    {
      id: 'opt1-s5',
      type: 'walk',
      instruction: `Walk to ${dest}`,
      detail: 'Covered walkway to destination entrance',
      timeString: addMinutes(depTime, 35),
      durationMinutes: 4,
      distanceMeters: 280,
      coordinates: [
        [endStop.latitude, endStop.longitude],
        [endStop.latitude + 0.0015, endStop.longitude + 0.002]
      ]
    }
  ];

  const opt2Steps: JourneyStep[] = [
    {
      id: 'opt2-s1',
      type: 'walk',
      instruction: `Walk to ${startStop.name}`,
      detail: 'Direct stroll to bus bay',
      timeString: depTime,
      durationMinutes: 7,
      distanceMeters: 480,
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
      timeString: addMinutes(depTime, 7),
      durationMinutes: 34,
      distanceMeters: 7400,
      fromStopName: startStop.name,
      toStopName: endStop.name,
      routeNumber: 'Bus 42',
      routeColor: '#F59E0B',
      stopsCount: 8,
      stopsList: [startStop.name, 'Riverside Promenade', 'Central Transit Hub', endStop.name],
      coordinates: [
        [startStop.latitude, startStop.longitude],
        [endStop.latitude, endStop.longitude]
      ]
    },
    {
      id: 'opt2-s3',
      type: 'walk',
      instruction: `Walk to ${dest}`,
      detail: 'Arrive at destination',
      timeString: addMinutes(depTime, 41),
      durationMinutes: 4,
      distanceMeters: 260,
      coordinates: [
        [endStop.latitude, endStop.longitude],
        [endStop.latitude + 0.001, endStop.longitude + 0.001]
      ]
    }
  ];

  const opt3Steps: JourneyStep[] = [
    {
      id: 'opt3-s1',
      type: 'walk',
      instruction: `Walk to ${startStop.name}`,
      detail: 'Station concourse entrance',
      timeString: depTime,
      durationMinutes: 8,
      distanceMeters: 580,
      coordinates: [
        [startStop.latitude - 0.004, startStop.longitude - 0.002],
        [startStop.latitude, startStop.longitude]
      ]
    },
    {
      id: 'opt3-s2',
      type: 'metro',
      instruction: 'Board Metro Green Line',
      detail: `Express underground direct route • 5 stops`,
      timeString: addMinutes(depTime, 8),
      durationMinutes: 22,
      distanceMeters: 8100,
      fromStopName: startStop.name,
      toStopName: endStop.name,
      routeNumber: 'Metro Green Line',
      routeColor: '#16A34A',
      stopsCount: 5,
      stopsList: [startStop.name, 'Downtown Plaza', 'Marina Bay Station', endStop.name],
      coordinates: [
        [startStop.latitude, startStop.longitude],
        [endStop.latitude, endStop.longitude]
      ]
    },
    {
      id: 'opt3-s3',
      type: 'walk',
      instruction: `Walk to ${dest}`,
      detail: 'Direct arrival',
      timeString: addMinutes(depTime, 30),
      durationMinutes: 5,
      distanceMeters: 340,
      coordinates: [
        [endStop.latitude, endStop.longitude],
        [endStop.latitude + 0.002, endStop.longitude + 0.001]
      ]
    }
  ];

  return [
    {
      id: 'route-fastest',
      title: 'Route 1 — Fastest',
      summaryTransport: 'Bus 216 → Metro Blue Line',
      badge: 'Fastest',
      departureTime: depTime,
      arrivalTime: addMinutes(depTime, 39),
      totalDurationMinutes: 39,
      fare: 28,
      transfersCount: 1,
      walkingDistanceMeters: 630,
      walkingDurationMinutes: 9,
      transportTypes: ['bus', 'metro'],
      departureStop: startStop.name,
      arrivalStop: endStop.name,
      carbonSavedKg: 1.4,
      isAccessible: true,
      steps: opt1Steps,
      allCoordinates: opt1Steps.flatMap(s => s.coordinates),
    },
    {
      id: 'route-cheapest',
      title: 'Route 2 — Cheapest & Direct',
      summaryTransport: 'Bus 42 (No Transfer)',
      badge: 'Cheapest',
      departureTime: depTime,
      arrivalTime: addMinutes(depTime, 45),
      totalDurationMinutes: 45,
      fare: 15,
      transfersCount: 0,
      walkingDistanceMeters: 740,
      walkingDurationMinutes: 11,
      transportTypes: ['bus'],
      departureStop: startStop.name,
      arrivalStop: endStop.name,
      carbonSavedKg: 1.2,
      isAccessible: true,
      steps: opt2Steps,
      allCoordinates: opt2Steps.flatMap(s => s.coordinates),
    },
    {
      id: 'route-fewest-transfers',
      title: 'Route 3 — Fewest Transfers',
      summaryTransport: 'Metro Green Line',
      badge: 'Fewest Transfers',
      departureTime: depTime,
      arrivalTime: addMinutes(depTime, 35),
      totalDurationMinutes: 35,
      fare: 25,
      transfersCount: 0,
      walkingDistanceMeters: 920,
      walkingDurationMinutes: 13,
      transportTypes: ['metro'],
      departureStop: startStop.name,
      arrivalStop: endStop.name,
      carbonSavedKg: 1.7,
      isAccessible: true,
      steps: opt3Steps,
      allCoordinates: opt3Steps.flatMap(s => s.coordinates),
    }
  ];
}
