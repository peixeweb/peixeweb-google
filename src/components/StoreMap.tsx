import {useCallback, useState} from 'react';
import {
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  InfoWindow,
  Map as GoogleMap,
  MapMouseEvent,
  useAdvancedMarkerRef,
  useApiIsLoaded,
  useApiLoadingStatus,
  APILoadingStatus,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  Crosshair,
  ExternalLink,
  Layers,
  MapPin,
  MessageCircle,
  Navigation,
} from 'lucide-react';
import {
  ComputedRouteSummary,
  LatLngPoint,
  STORE_INFO,
  TravelModeOption,
  getGoogleMapsDirectionsUrl,
  getWhatsAppUrl,
} from '../constants/store';
import {RouteLayer} from './RouteLayer';
import {StoreFacadeImage} from './StoreFacadeImage';

interface StoreMapProps {
  origin: LatLngPoint | null;
  originLabel: string;
  travelMode: TravelModeOption;
  isPickingOriginOnMap: boolean;
  onMapPickOrigin: (point: LatLngPoint) => void;
  onRequestGpsRoute: () => void;
  onRouteLoading: (loading: boolean) => void;
  onRouteComputed: (summary: ComputedRouteSummary | null) => void;
  onRouteError: (message: string | null) => void;
}

function MapToolbarControls({
  mapTypeId,
  onToggleMapType,
}: {
  mapTypeId: 'roadmap' | 'hybrid';
  onToggleMapType: () => void;
}) {
  const map = useMap();

  const handleRecenter = useCallback(() => {
    if (!map) return;
    map.panTo(STORE_INFO.position);
    map.setZoom(17);
  }, [map]);

  return (
    <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
      <button
        type="button"
        onClick={onToggleMapType}
        className="min-h-[40px] px-3 py-2 bg-white/95 backdrop-blur-sm text-slate-800 border border-slate-200 rounded-xl shadow-sm text-xs font-medium flex items-center gap-1.5 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors cursor-pointer whitespace-nowrap shrink-0"
      >
        <Layers className="w-3.5 h-3.5 text-black" aria-hidden="true" />
        <span>{mapTypeId === 'roadmap' ? 'Satélite' : 'Mapa'}</span>
      </button>

      <button
        type="button"
        onClick={handleRecenter}
        className="min-h-[40px] px-3 py-2 bg-white/95 backdrop-blur-sm text-slate-800 border border-slate-200 rounded-xl shadow-sm text-xs font-medium flex items-center gap-1.5 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors cursor-pointer whitespace-nowrap shrink-0"
      >
        <Crosshair className="w-3.5 h-3.5 text-black" aria-hidden="true" />
        <span>Centralizar Peixeweb</span>
      </button>
    </div>
  );
}

export function StoreMap({
  origin,
  originLabel,
  travelMode,
  isPickingOriginOnMap,
  onMapPickOrigin,
  onRequestGpsRoute,
  onRouteLoading,
  onRouteComputed,
  onRouteError,
}: StoreMapProps) {
  const isLoaded = useApiIsLoaded();
  const loadingStatus = useApiLoadingStatus();
  const [storeMarkerRef, storeMarker] = useAdvancedMarkerRef();
  const [infoWindowOpen, setInfoWindowOpen] = useState(true);
  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'hybrid'>('roadmap');

  const handleMapClick = useCallback(
    (ev: MapMouseEvent) => {
      if (!isPickingOriginOnMap || !ev.detail.latLng) return;
      onMapPickOrigin({
        lat: ev.detail.latLng.lat,
        lng: ev.detail.latLng.lng,
      });
    },
    [isPickingOriginOnMap, onMapPickOrigin],
  );

  const hasApiError =
    loadingStatus === APILoadingStatus.FAILED ||
    loadingStatus === APILoadingStatus.AUTH_FAILURE;

  return (
    <div className="relative w-full h-[460px] lg:h-[700px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
      {isPickingOriginOnMap && (
        <div className="absolute top-3 left-3 right-3 sm:right-auto z-20 bg-black text-white px-3.5 py-2 rounded-xl shadow-md text-xs font-medium flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-300 shrink-0" aria-hidden="true" />
          <span>Clique em qualquer ponto do mapa para definir sua partida</span>
        </div>
      )}

      {hasApiError ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-100">
          <MapPin className="w-10 h-10 text-black mb-3" aria-hidden="true" />
          <p className="font-display font-bold text-slate-900 text-lg">
            Mapa interativo indisponível no momento
          </p>
          <p className="text-sm text-slate-600 max-w-md mt-1 mb-4">
            Você ainda pode abrir a localização exata e traçar sua rota
            diretamente no aplicativo Google Maps.
          </p>
          <a
            href={getGoogleMapsDirectionsUrl(origin, travelMode)}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-5 py-2.5 bg-black text-white rounded-xl text-sm font-semibold inline-flex items-center gap-2 hover:bg-gray-800 transition-colors"
          >
            <Navigation className="w-4 h-4" aria-hidden="true" />
            <span>Abrir rota no Google Maps</span>
          </a>
        </div>
      ) : (
        <GoogleMap
          mapId="DEMO_MAP_ID"
          defaultCenter={STORE_INFO.position}
          defaultZoom={16}
          mapTypeId={mapTypeId}
          gestureHandling="greedy"
          disableDefaultUI={false}
          streetViewControl={true}
          mapTypeControl={false}
          fullscreenControl={true}
          onClick={handleMapClick}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{width: '100%', height: '100%'}}
        >
          <MapToolbarControls
            mapTypeId={mapTypeId}
            onToggleMapType={() =>
              setMapTypeId((prev) =>
                prev === 'roadmap' ? 'hybrid' : 'roadmap',
              )
            }
          />

          {/* Marcador da loja com a foto real da fachada azul no local da loja */}
          <AdvancedMarker
            ref={storeMarkerRef}
            position={STORE_INFO.position}
            anchorPoint={AdvancedMarkerAnchorPoint.BOTTOM}
            title={`${STORE_INFO.fullName} (${STORE_INFO.numberLabel})`}
            zIndex={1000}
            onClick={() => setInfoWindowOpen((prev) => !prev)}
          >
            <div className="flex flex-col items-center cursor-pointer group select-none">
              <div className="bg-white p-1.5 rounded-2xl shadow-lg border-2 border-black group-hover:scale-105 transition-transform duration-150">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-black relative">
                  <StoreFacadeImage
                    className="w-full h-full object-cover"
                    alt="Foto da fachada da Conduta Autopeças no mapa"
                  />
                </div>
                <div className="mt-1 px-1 text-center">
                  <p className="font-display font-bold text-[11px] leading-tight text-slate-900 whitespace-nowrap">
                    {STORE_INFO.shortName}
                  </p>
                  <p className="text-[10px] font-semibold text-black leading-tight whitespace-nowrap">
                    {STORE_INFO.numberLabel}
                  </p>
                </div>
              </div>
              <div className="w-3.5 h-3.5 bg-blue-700 rotate-45 -mt-2 border-r-2 border-b-2 border-white shadow-sm" />
            </div>
          </AdvancedMarker>

          {infoWindowOpen && storeMarker && (
            <InfoWindow
              anchor={storeMarker}
              pixelOffset={[0, -4]}
              onCloseClick={() => setInfoWindowOpen(false)}
              maxWidth={290}
            >
              <div className="p-1 font-sans text-slate-900">
                <div className="w-full h-32 rounded-lg overflow-hidden mb-2.5 bg-black">
                  <StoreFacadeImage
                    className="w-full h-full object-cover"
                    alt="Fachada da Conduta Locações, Autopeças e Manutenções"
                  />
                </div>
                <h3 className="font-display font-bold text-sm text-slate-900 leading-snug">
                  {STORE_INFO.fullName}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Nº {STORE_INFO.numberLabel} · {STORE_INFO.cityLabel} ·{' '}
                  {STORE_INFO.segment}
                </p>

                <div className="mt-3 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setInfoWindowOpen(false);
                      onRequestGpsRoute();
                    }}
                    className="w-full min-h-[40px] px-3 py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Como chegar na Peixeweb</span>
                  </button>

                  <div className="grid grid-cols-2 gap-1.5">
                    <a
                      href={getWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[38px] px-2.5 py-1.5 bg-black hover:bg-gray-800 text-white rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors whitespace-nowrap"
                    >
                      <MessageCircle
                        className="w-3.5 h-3.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href={STORE_INFO.mapsShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[38px] px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors whitespace-nowrap"
                    >
                      <ExternalLink
                        className="w-3.5 h-3.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span>Maps</span>
                    </a>
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}

          {origin && (
            <AdvancedMarker
              position={origin}
              anchorPoint={AdvancedMarkerAnchorPoint.BOTTOM}
              title={originLabel || 'Ponto de partida'}
              zIndex={900}
            >
              <div className="flex flex-col items-center select-none">
                <div className="bg-emerald-700 text-white px-2.5 py-1 rounded-lg shadow-md border-2 border-white text-[11px] font-semibold whitespace-nowrap flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-200" aria-hidden="true" />
                  <span>Partida</span>
                </div>
                <div className="w-2.5 h-2.5 bg-emerald-700 rotate-45 -mt-1.5 border-r-2 border-b-2 border-white" />
              </div>
            </AdvancedMarker>
          )}

          <RouteLayer
            origin={origin}
            destination={STORE_INFO.position}
            travelMode={travelMode}
            onRouteLoading={onRouteLoading}
            onRouteComputed={onRouteComputed}
            onRouteError={onRouteError}
          />
        </GoogleMap>
      )}

      {!isLoaded && !hasApiError && (
        <div className="absolute inset-0 bg-slate-100/80 backdrop-blur-xs flex items-center justify-center pointer-events-none">
          <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm text-sm font-medium text-slate-700">
            Carregando Google Maps...
          </div>
        </div>
      )}
    </div>
  );
}

