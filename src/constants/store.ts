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
  fullName:
    'Peixeweb - Agência de Tráfego & Engenharia de Lucro e Inteligência Artificial',
  numberLabel: '',
  segment: 'Tráfego Pago',
  cityLabel: '',
  position: {lat: -5.1440677, lng: -42.7866605} as LatLngPoint,
  mapsShareUrl:
    'https://www.google.com/maps/search/?api=1&query=-5.1440677,-42.7866605',
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
  const text =
    customMessage ??
    'Olá! Vim pelo site da Peixeweb e quero saber mais sobre tráfego pago.';
  return `https://wa.me/55${STORE_INFO.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

const GOOGLE_TRAVEL_MODES: Record<TravelModeOption, string> = {
  DRIVING: 'driving',
  TWO_WHEELER: 'two-wheeler',
  WALKING: 'walking',
};

export function getGoogleMapsDirectionsUrl(
  origin?: LatLngPoint | null,
  travelMode: TravelModeOption = 'DRIVING',
): string {
  const params = new URLSearchParams({
    api: '1',
    destination: `${STORE_INFO.position.lat},${STORE_INFO.position.lng}`,
    travelmode: GOOGLE_TRAVEL_MODES[travelMode],
  });
  if (origin) {
    params.set('origin', `${origin.lat},${origin.lng}`);
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`;
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
