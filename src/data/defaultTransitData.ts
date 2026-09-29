import { TransitRoute, TransitStop, ServiceAlert } from '../types.ts';

export const DEFAULT_STOPS: TransitStop[] = [
  { id: 1, name: 'Central Transit Hub', code: 'CTH-01', type: 'hub', latitude: 1.2834, longitude: 103.8505, accessible: true },
  { id: 2, name: 'City Center Terminal', code: 'CCT-02', type: 'bus', latitude: 1.2931, longitude: 103.8558, accessible: true },
  { id: 3, name: 'Marina Bay Station', code: 'MBS-03', type: 'metro', latitude: 1.2764, longitude: 103.8546, accessible: true },
  { id: 4, name: 'Downtown Plaza', code: 'DTP-04', type: 'bus', latitude: 1.2801, longitude: 103.8475, accessible: true },
  { id: 5, name: 'Orchard Boulevard', code: 'OBD-05', type: 'metro', latitude: 1.3048, longitude: 103.8318, accessible: true },
  { id: 6, name: 'University Gate', code: 'UNG-06', type: 'bus', latitude: 1.2956, longitude: 103.7767, accessible: true },
  { id: 7, name: 'University Station', code: 'UNS-07', type: 'metro', latitude: 1.2932, longitude: 103.7844, accessible: true },
  { id: 8, name: 'Tech Park North', code: 'TPN-08', type: 'bus', latitude: 1.2882, longitude: 103.7891, accessible: true },
  { id: 9, name: 'East Coast Interchange', code: 'ECI-09', type: 'hub', latitude: 1.3065, longitude: 103.9054, accessible: true },
  { id: 10, name: 'Airport Terminal 1-3', code: 'AIR-10', type: 'train', latitude: 1.3644, longitude: 103.9915, accessible: true },
  { id: 11, name: 'North Rail Junction', code: 'NRJ-11', type: 'train', latitude: 1.4361, longitude: 103.7865, accessible: true },
  { id: 12, name: 'West Gateway', code: 'WGW-12', type: 'train', latitude: 1.3331, longitude: 103.7423, accessible: true },
  { id: 13, name: 'Riverside Promenade', code: 'RSP-13', type: 'bus', latitude: 1.2895, longitude: 103.8465, accessible: true },
  { id: 14, name: 'Botanical Gardens', code: 'BTG-14', type: 'metro', latitude: 1.3223, longitude: 103.8157, accessible: true },
  { id: 15, name: 'Harbourfront Station', code: 'HBF-15', type: 'metro', latitude: 1.2654, longitude: 103.8219, accessible: true }
];

export const DEFAULT_ROUTES: TransitRoute[] = [
  {
    id: 1,
    routeNumber: 'Bus 216',
    name: 'City Express (Hub - Marina Bay)',
    type: 'bus',
    color: '#2563EB',
    status: 'normal',
    frequencyMinutes: 8,
    baseFare: 15,
    description: 'Direct city express connection linking Central Transit Hub, Downtown, and Marina Bay.'
  },
  {
    id: 2,
    routeNumber: 'Metro Blue Line',
    name: 'Downtown Urban Line',
    type: 'metro',
    color: '#0284C7',
    status: 'delay',
    frequencyMinutes: 4,
    baseFare: 25,
    description: 'High-capacity metro corridor linking Harbourfront, Central Hub, Orchard, and Botanical Gardens.'
  },
  {
    id: 3,
    routeNumber: 'Metro Green Line',
    name: 'East-West Metro Line',
    type: 'metro',
    color: '#16A34A',
    status: 'normal',
    frequencyMinutes: 5,
    baseFare: 25,
    description: 'Main trans-city artery connecting West Gateway, Central Hub, and Airport.'
  },
  {
    id: 4,
    routeNumber: 'Express Train 101',
    name: 'North-South Commuter Rail',
    type: 'train',
    color: '#DC2626',
    status: 'normal',
    frequencyMinutes: 15,
    baseFare: 45,
    description: 'Regional commuter train service connecting North Rail Junction to Central Transit Hub.'
  },
  {
    id: 5,
    routeNumber: 'Bus 42',
    name: 'Campus & Tech Park Loop',
    type: 'bus',
    color: '#F59E0B',
    status: 'normal',
    frequencyMinutes: 12,
    baseFare: 12,
    description: 'Circulating service linking University Gate, Tech Park North, and West Gateway.'
  },
  {
    id: 6,
    routeNumber: 'Bus 88',
    name: 'Eastside Coastal Shuttle',
    type: 'bus',
    color: '#9333EA',
    status: 'disruption',
    frequencyMinutes: 10,
    baseFare: 18,
    description: 'Cross-town shuttle connecting East Coast Interchange to Downtown and Orchard Boulevard.'
  }
];

export const DEFAULT_ALERTS: ServiceAlert[] = [
  {
    id: 1,
    routeId: 2,
    routeNumber: 'Metro Blue Line',
    title: 'Metro Blue Line: Minor Signal Delay',
    description: 'Trains are operating with a 4 to 6 minute delay near Orchard Boulevard due to scheduled signaling maintenance.',
    severity: 'delay',
    transportType: 'metro',
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    routeId: 6,
    routeNumber: 'Bus 88',
    title: 'Bus 88: Road Diversion & Disruption',
    description: 'Due to urgent road resurfacing on Coastal Highway, Bus 88 stops between Marina and East Coast are diverted.',
    severity: 'disruption',
    transportType: 'bus',
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    routeId: 1,
    routeNumber: 'Bus 216',
    title: 'Bus 216: Normal Peak Operations',
    description: 'Additional double-decker buses deployed on Bus 216 to support morning commuter volume.',
    severity: 'normal',
    transportType: 'bus',
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    routeId: 3,
    routeNumber: 'Metro Green Line',
    title: 'Metro Green Line: Normal Service',
    description: 'All Green Line trains running smoothly at 5-minute headways. Airport connections on schedule.',
    severity: 'normal',
    transportType: 'metro',
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 5,
    routeId: 4,
    routeNumber: 'Express Train 101',
    title: 'Express Train 101: On Time',
    description: 'All regional commuter services between North Rail Junction and Central Hub are running on time.',
    severity: 'normal',
    transportType: 'train',
    active: true,
    updatedAt: new Date().toISOString()
  }
];
