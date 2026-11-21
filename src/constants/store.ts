import etImage from '../../et.png';

export type TravelModeOption = 'DRIVING' | 'TWO_WHEELER' | 'WALKING';

export interface LatLngPoint {
  lat: number;
  lng: number;
}

export interface RouteStepSummary {
  instruction: string;
  distanceText: string;
  durationText: string;
}

export interface ComputedRouteSummary {
  distanceMeters: number;
  durationMillis: number;
  distanceText: string;
  durationText: string;
  steps: RouteStepSummary[];
}

export const STORE_INFO = {
  shortName: 'Peixeweb',
  fullName: 'Peixeweb - Agência de Tráfego & Engenharia de Lucro',
  numberLabel: '',
  segment: 'Tráfego Pago',
  cityLabel: '',
  position: {lat: -5.1440677, lng: -42.7866605} as LatLngPoint,
  mapsShareUrl: '',
  photoUrl: etImage,
  whatsappNumber: '11914716715',
  whatsappDisplay: '11 91471-6715',
  specialties: [
    {
      title: 'Tráfego Pago',
      detail: 'Estratégias avançadas para escala de vendas.',
    },
    {
      title: 'Engenharia de Lucro',
      detail: 'Otimização focada em resultados.',
    },
  ],
  brands: [],
} as const;

export const TRAVEL_MODE_LABELS: Record<TravelModeOption, string> = {
  DRIVING: 'Carro',
  TWO_WHEELER: 'Moto',
  WALKING: 'A pé',
};

export function getWhatsAppUrl(customMessage?: string): string {
  return '#';
}

export function getGoogleMapsDirectionsUrl(
  origin?: LatLngPoint | null,
  travelMode: TravelModeOption = 'DRIVING',
): string {
  return '#';
}

export function formatDistancePt(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

export function formatDurationPt(millis: number): string {
  const totalMinutes = Math.max(1, Math.round(millis / 60000));
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `${hours} h ${mins} min` : `${hours} h`;
}
