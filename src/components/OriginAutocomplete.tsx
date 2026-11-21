import {useCallback, useRef, useState} from 'react';
import {useMapsLibrary} from '@vis.gl/react-google-maps';
import {Loader2, MapPin, Search, X} from 'lucide-react';
import {LatLngPoint} from '../constants/store';
import {useAutocompleteSuggestions} from '../hooks/useAutocompleteSuggestions';
import {notifyQuotaExceededIfApplicable} from '../utils/quotaError';

interface OriginAutocompleteProps {
  selectedLabel: string;
  onSelectOrigin: (point: LatLngPoint, label: string) => void;
  onClearOrigin: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function OriginAutocomplete({
  selectedLabel,
  onSelectOrigin,
  onClearOrigin,
  inputRef,
}: OriginAutocompleteProps) {
  const placesLib = useMapsLibrary('places');
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectingIndex, setSelectingIndex] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const localRef = useRef<HTMLInputElement | null>(null);
  const activeRef = inputRef ?? localRef;

  const {suggestions, isLoading, error, resetSession} =
    useAutocompleteSuggestions(inputValue);

  const handleSelect = useCallback(
    async (
      suggestion: google.maps.places.AutocompleteSuggestion,
      index: number,
    ) => {
      if (!placesLib || !suggestion.placePrediction) return;

      setSelectingIndex(index);
      setFetchError(null);

      try {
        const place = suggestion.placePrediction.toPlace();
        await place.fetchFields({
          fields: ['displayName', 'formattedAddress', 'location'],
        });

        const loc = place.location;
        if (!loc) {
          setFetchError('Local selecionado não possui coordenadas válidas.');
          return;
        }

        const label =
          place.formattedAddress ||
          place.displayName ||
          suggestion.placePrediction.text.text;

        onSelectOrigin({lat: loc.lat(), lng: loc.lng()}, label);
        setInputValue('');
        setIsOpen(false);
        resetSession();
      } catch (err) {
        notifyQuotaExceededIfApplicable(err);
        setFetchError('Não foi possível obter as coordenadas deste endereço.');
      } finally {
        setSelectingIndex(null);
      }
    },
    [placesLib, onSelectOrigin, resetSession],
  );

  const displayError = fetchError || error;

  return (
    <div className="relative">
      <label
        htmlFor="origin-search-input"
        className="block text-xs font-medium text-slate-600 mb-1.5"
      >
        Ponto de partida (endereço, bairro ou cidade)
      </label>

      <div className="relative flex items-center">
        <Search
          className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none"
          aria-hidden="true"
        />
        <input
          ref={activeRef}
          id="origin-search-input"
          type="text"
          value={inputValue}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
            setFetchError(null);
          }}
          placeholder={
            selectedLabel
              ? `Partida: ${selectedLabel}`
              : 'Digite seu endereço ou ponto de partida...'
          }
          className="w-full min-h-[44px] pl-10 pr-10 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-colors"
          autoComplete="off"
        />

        {isLoading ? (
          <Loader2
            className="w-4 h-4 text-black animate-spin absolute right-3.5"
            aria-label="Buscando endereços"
          />
        ) : (
          (inputValue || selectedLabel) && (
            <button
              type="button"
              onClick={() => {
                setInputValue('');
                setIsOpen(false);
                setFetchError(null);
                resetSession();
                onClearOrigin();
              }}
              aria-label="Limpar ponto de partida"
              className="absolute right-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )
        )}
      </div>

      {displayError && (
        <p className="mt-1.5 text-xs text-red-600">{displayError}</p>
      )}

      {isOpen && suggestions.length > 0 && (
        <ul
          role="listbox"
          aria-label="Sugestões de endereço"
          className="absolute z-30 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100"
        >
          {suggestions.map((suggestion, index) => {
            const text = suggestion.placePrediction?.text.text ?? '';
            if (!text) return null;
            return (
              <li key={`${text}-${index}`}>
                <button
                  type="button"
                  disabled={selectingIndex !== null}
                  onClick={() => void handleSelect(suggestion, index)}
                  className="w-full text-left px-3.5 py-2.5 min-h-[44px] flex items-start gap-2.5 text-sm text-slate-800 hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none transition-colors cursor-pointer"
                >
                  {selectingIndex === index ? (
                    <Loader2 className="w-4 h-4 text-black animate-spin shrink-0 mt-0.5" />
                  ) : (
                    <MapPin
                      className="w-4 h-4 text-black shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                  )}
                  <span className="leading-snug">{text}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

