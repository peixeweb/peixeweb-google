import {useCallback, useEffect, useRef, useState} from 'react';
import {APIProvider} from '@vis.gl/react-google-maps';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  ExternalLink,
  Loader2,
  MapPin,
  MessageCircle,
  Navigation,
  Route as RouteIcon,
} from 'lucide-react';
import {OriginAutocomplete} from './components/OriginAutocomplete';
import {StoreFacadeImage} from './components/StoreFacadeImage';
import {StoreMap} from './components/StoreMap';
import etImage from '../et.png';
import {
  ComputedRouteSummary,
  LatLngPoint,
  STORE_INFO,
  TRAVEL_MODE_LABELS,
  TravelModeOption,
  getGoogleMapsDirectionsUrl,
  getWhatsAppUrl,
} from './constants/store';

const MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';

export default function App() {
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [origin, setOrigin] = useState<LatLngPoint | null>(null);
  const [originLabel, setOriginLabel] = useState('');
  const [travelMode, setTravelMode] = useState<TravelModeOption>('DRIVING');
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [geoStatusMessage, setGeoStatusMessage] = useState<string | null>(null);
  const [isPickingOnMap, setIsPickingOnMap] = useState(false);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [routeSummary, setRouteSummary] = useState<ComputedRouteSummary | null>(
    null,
  );
  const [routeError, setRouteError] = useState<string | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  const originInputRef = useRef<HTMLInputElement | null>(null);
  const routePanelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  const handleHowToGetThereClick = useCallback(() => {
    setGeoStatusMessage(null);
    setIsPickingOnMap(false);

    routePanelRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'});

    if (!('geolocation' in navigator)) {
      setGeoStatusMessage(
        'Seu navegador não suporta GPS automático. Digite seu endereço abaixo ou marque sua partida no mapa.',
      );
      window.setTimeout(() => originInputRef.current?.focus(), 250);
      return;
    }

    setIsLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingUser(false);
        setGeoStatusMessage(null);
        setOrigin({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setOriginLabel('Minha localização atual (GPS)');
      },
      (err) => {
        setIsLocatingUser(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoStatusMessage(
            'Permissão de localização recusada. Digite seu endereço de partida abaixo ou clique em "Marcar no mapa".',
          );
        } else {
          setGeoStatusMessage(
            'Não foi possível obter sua posição via GPS. Digite seu endereço abaixo ou marque sua partida diretamente no mapa.',
          );
        }
        window.setTimeout(() => originInputRef.current?.focus(), 250);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      },
    );
  }, []);

  const handleSelectAutocompleteOrigin = useCallback(
    (point: LatLngPoint, label: string) => {
      setIsPickingOnMap(false);
      setGeoStatusMessage(null);
      setOrigin(point);
      setOriginLabel(label);
    },
    [],
  );

  const handleMapPickOrigin = useCallback((point: LatLngPoint) => {
    setIsPickingOnMap(false);
    setGeoStatusMessage(null);
    setOrigin(point);
    setOriginLabel(
      `Ponto no mapa (${point.lat.toFixed(5)}, ${point.lng.toFixed(5)})`,
    );
  }, []);

  const handleClearOrigin = useCallback(() => {
    setOrigin(null);
    setOriginLabel('');
    setRouteSummary(null);
    setRouteError(null);
    setGeoStatusMessage(null);
    setShowSteps(false);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <a
            href="#localizacao"
            className="font-display text-lg font-extrabold tracking-tight text-black whitespace-nowrap shrink-0"
          >
            {STORE_INFO.shortName}
          </a>

          <nav
            aria-label="Navegação principal"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <a
              href="#localizacao"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Localização
            </a>
            <a
              href="#rota"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Traçar rota
            </a>
            <a
              href="#servicos"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Serviços
            </a>
            <a
              href="#contato"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Contato
            </a>
            <a
              href="https://vendas-pela-internet.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[40px] px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <img src={etImage} alt="Peixeweb" className="w-4 h-4 shrink-0" />
              <span>Vendas Pela Internet</span>
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleHowToGetThereClick}
              className="min-h-[40px] px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-black hover:bg-gray-800 rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
            >
              <Navigation className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">
                Como chegar na Peixeweb
              </span>
              <span className="sm:hidden">Como chegar</span>
            </button>
          </div>
        </div>
      </header>

      <APIProvider
        apiKey={MAPS_API_KEY}
        libraries={['marker', 'places', 'routes']}
        language="pt-BR"
        region="BR"
      >
        <main className="flex-1">
          {/* Primary Store Locator & Interactive Route Workspace */}
          <section
            id="localizacao"
            ref={routePanelRef}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
              {/* Left Column: Store Identity, Primary CTAs & Route Planner */}
              <div className="lg:col-span-5 flex flex-col gap-5">
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="aspect-[16/10] w-full bg-black relative overflow-hidden">
                    <StoreFacadeImage
                      className="w-full h-full object-contain mx-auto"
                      alt="Fachada da Conduta"
                    />
                  </div>

                  <div className="p-5 sm:p-6">
                    <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1.5 [text-wrap:balance]">
                      {STORE_INFO.fullName}
                    </h1>

                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                      Trace sua rota até a Peixeweb diretamente no Google Maps ou
                      fale agora com nossa equipe pelo WhatsApp.
                    </p>

                    {/* Primary Action Stack */}
                    <div className="mt-5 flex flex-col gap-3">
                      <button
                        type="button"
                        onClick={handleHowToGetThereClick}
                        disabled={isLocatingUser}
                        className="w-full min-h-[48px] px-5 py-3 bg-black hover:bg-gray-800 disabled:opacity-75 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 shadow-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                      >
                        {isLocatingUser ? (
                          <Loader2
                            className="w-4 h-4 animate-spin shrink-0"
                            aria-hidden="true"
                          />
                        ) : (
                          <Navigation
                            className="w-4 h-4 shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        <span className="whitespace-nowrap">
                          {isLocatingUser
                            ? 'Localizando sua posição...'
                            : 'Como chegar na Peixeweb'}
                        </span>
                      </button>

                      <a
                        href={getWhatsAppUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full min-h-[48px] px-5 py-3 bg-black hover:bg-gray-800 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                      >
                        <MessageCircle
                          className="w-4 h-4 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="whitespace-nowrap">
                          WhatsApp: {STORE_INFO.whatsappDisplay}
                        </span>
                      </a>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
                      <a
                        href={getGoogleMapsDirectionsUrl(origin, travelMode)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium text-black hover:text-black hover:underline whitespace-nowrap"
                      >
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Abrir rota no Google Maps</span>
                      </a>

                      <a
                        href={STORE_INFO.mapsShareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-900 hover:underline whitespace-nowrap"
                      >
                        <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Ver escritório</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Route Calculator Box */}
                <div
                  id="rota"
                  className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                      <RouteIcon
                        className="w-4 h-4 text-black"
                        aria-hidden="true"
                      />
                      <span>Planejar rota no mapa</span>
                    </h2>

                    <div
                      role="group"
                      aria-label="Modo de transporte"
                      className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg"
                    >
                      {(
                        Object.keys(TRAVEL_MODE_LABELS) as TravelModeOption[]
                      ).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setTravelMode(mode)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            travelMode === mode
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {TRAVEL_MODE_LABELS[mode]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <OriginAutocomplete
                    selectedLabel={originLabel}
                    onSelectOrigin={handleSelectAutocompleteOrigin}
                    onClearOrigin={handleClearOrigin}
                    inputRef={originInputRef}
                  />

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleHowToGetThereClick}
                      disabled={isLocatingUser}
                      className="min-h-[42px] px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Compass className="w-3.5 h-3.5 text-black shrink-0" />
                      <span>Usar meu GPS</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPickingOnMap((prev) => !prev)}
                      className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                        isPickingOnMap
                          ? 'bg-black text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {isPickingOnMap
                          ? 'Cancelar seleção'
                          : 'Marcar no mapa'}
                      </span>
                    </button>
                  </div>

                  {geoStatusMessage && (
                    <p className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 leading-relaxed">
                      {geoStatusMessage}
                    </p>
                  )}

                  {isRouteLoading && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-black font-medium">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Calculando melhor trajeto no Google Maps...</span>
                    </div>
                  )}

                  {routeError && (
                    <div className="mt-4 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 leading-relaxed">
                      <p>{routeError}</p>
                      <a
                        href={getGoogleMapsDirectionsUrl(origin, travelMode)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold underline mt-1.5"
                      >
                        <span>Abrir rota no Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {routeSummary && !isRouteLoading && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-baseline justify-between gap-4">
                        <div>
                          <p className="text-xs text-slate-500">
                            Tempo estimado ({TRAVEL_MODE_LABELS[travelMode]})
                          </p>
                          <p className="font-display font-bold text-xl text-slate-900 font-mono-tabular">
                            {routeSummary.durationText}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-slate-500">Distância</p>
                          <p className="font-display font-bold text-xl text-black font-mono-tabular">
                            {routeSummary.distanceText}
                          </p>
                        </div>
                      </div>

                      {originLabel && (
                        <p className="text-xs text-slate-600 mt-2 truncate">
                          Partida: <span className="font-medium">{originLabel}</span>
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        {routeSummary.steps.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowSteps((prev) => !prev)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 py-1 cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>
                              {showSteps
                                ? 'Ocultar instruções'
                                : `Ver ${routeSummary.steps.length} instruções`}
                            </span>
                            {showSteps ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        <a
                          href={getGoogleMapsDirectionsUrl(origin, travelMode)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-black hover:text-black hover:underline whitespace-nowrap"
                        >
                          <span>Iniciar GPS no Google Maps</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      {showSteps && routeSummary.steps.length > 0 && (
                        <ol className="mt-3 max-h-52 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50">
                          {routeSummary.steps.map((step, idx) => (
                            <li
                              key={idx}
                              className="px-3.5 py-2.5 text-xs text-slate-700 flex items-start justify-between gap-3"
                            >
                              <span className="leading-relaxed">
                                <span className="font-mono-tabular font-semibold text-slate-400 mr-1.5">
                                  {idx + 1}.
                                </span>
                                {step.instruction}
                              </span>
                              {step.distanceText && (
                                <span className="font-mono-tabular text-slate-500 whitespace-nowrap shrink-0">
                                  {step.distanceText}
                                </span>
                              )}
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Live Interactive Google Map */}
              <div className="lg:col-span-7 flex flex-col">
                <StoreMap
                  origin={origin}
                  originLabel={originLabel}
                  travelMode={travelMode}
                  isPickingOriginOnMap={isPickingOnMap}
                  onMapPickOrigin={handleMapPickOrigin}
                  onRequestGpsRoute={handleHowToGetThereClick}
                  onRouteLoading={setIsRouteLoading}
                  onRouteComputed={setRouteSummary}
                  onRouteError={setRouteError}
                />

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 px-1">
                  <span>
                    Coordenadas da área:{' '}
                    <span className="font-mono-tabular text-slate-700">
                      {STORE_INFO.position.lat.toFixed(6)},{' '}
                      {STORE_INFO.position.lng.toFixed(6)}
                    </span>
                  </span>
                  <span>
                    Clique na foto da fachada no mapa para ver detalhes da loja.
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Services Section from Storefront Facade */}
          <section
            id="servicos"
            className="border-t border-slate-200 bg-white py-12 lg:py-14"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <p className="text-xs font-semibold text-black">
                    Tráfego Pago
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
                    Especialista em Meta Ads e Google Ads e Inteligência Artificial
                  </h2>
                </div>

                <p className="text-sm text-slate-600">
                  Especialista em Meta Ads e Google Ads e Inteligência Artificial
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {STORE_INFO.specialties.map((item, idx) => (
                  <div
                    key={item.title}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60"
                  >
                    <p className="font-mono-tabular text-xs font-semibold text-black">
                      0{idx + 1}.
                    </p>
                    <h3 className="font-display font-bold text-base text-slate-900 mt-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Direct Contact & WhatsApp Section */}
          <section
            id="contato"
            className="border-t border-slate-200 bg-slate-50 py-12 lg:py-14"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-black text-white rounded-3xl p-6 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="max-w-xl">
                  <p className="text-xs font-semibold text-amber-300">
                    Agência de Marketing Digital
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mt-1.5 [text-wrap:balance]">
                    Transforme cliques em clientes com estratégia de tráfego pago.
                  </h2>
                  <p className="text-sm text-gray-100 mt-2 leading-relaxed">
                    Fale com nossa equipe pelo WhatsApp para conhecer nossas
                    soluções de marketing digital e impulsionar seu negócio.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <p className="text-xs font-semibold text-amber-300 whitespace-nowrap">
                    Peixeweb - Agência de Tráfego &amp; Engenharia de Lucro
                  </p>
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[48px] px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span>WhatsApp: {STORE_INFO.whatsappNumber}</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleHowToGetThereClick}
                    className="min-h-[48px] px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <img src={etImage} alt="Peixeweb" className="w-5 h-5 shrink-0" />
                    <span>Como chegar na Peixeweb</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </APIProvider>

      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            {[STORE_INFO.fullName, STORE_INFO.numberLabel, STORE_INFO.cityLabel]
              .filter(Boolean)
              .join(' · ')}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              WhatsApp {STORE_INFO.whatsappDisplay}
            </a>
            <a
              href="https://maps.google.com/help/terms_maps/?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              Termos do Google Maps
            </a>
            <a
              href="https://vendas-pela-internet.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[36px] px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <img src={etImage} alt="Peixeweb" className="w-4 h-4 shrink-0" />
              <span>Vendas Pela Internet</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

