import React, { useState, useMemo } from 'react';
import { 
  COUNTRIES, 
  ALL_REGIONS, 
  EXPANDED_LOCATIONS, 
  LocationItem, 
  SettlementType,
  CYRILLIC_ALPHABET,
  normalizeCyrillic,
  searchLocationsWithPrefix,
  ScoredLocationItem
} from '../locationsData';
import { X, Search, MapPin, Check, Plus, Globe, ChevronRight, Sparkles } from 'lucide-react';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation: string; // Current value (e.g. "Шангалы" or "all")
  onSelect: (locationName: string, fullItem?: LocationItem) => void;
  allowAll?: boolean; // Show "Все сёла и регионы" option
  title?: string;
}

// Helper to highlight matching letters in the UI
const HighlightMatch: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  const q = query.trim();
  if (!q) return <span>{text}</span>;

  const normQuery = normalizeCyrillic(q);
  const normText = normalizeCyrillic(text);
  const index = normText.indexOf(normQuery);

  if (index === -1) return <span>{text}</span>;

  const before = text.slice(0, index);
  const match = text.slice(index, index + q.length);
  const after = text.slice(index + q.length);

  return (
    <span>
      {before}
      <span className="bg-emerald-200 text-emerald-950 font-black px-0.5 rounded-xs shadow-2xs">
        {match}
      </span>
      {after}
    </span>
  );
};

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  selectedLocation,
  onSelect,
  allowAll = true,
  title = 'Выбор региона и поселения'
}) => {
  if (!isOpen) return null;

  // Selected Country Tab
  const [activeCountry, setActiveCountry] = useState<'RU' | 'BY' | 'KZ' | 'CIS'>('RU');

  // Selected Region Filter within that country
  const [selectedRegionId, setSelectedRegionId] = useState<string>('all');

  // Search input query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected initial letter filter (e.g. "А", "Б", "В"...)
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  // Custom settlement entry mode
  const [isManualEntry, setIsManualEntry] = useState<boolean>(false);
  const [manualName, setManualName] = useState<string>('');
  const [manualType, setManualType] = useState<SettlementType>('село');
  const [manualRegion, setManualRegion] = useState<string>('Архангельская область');

  // Filtered regions for the selected country tab
  const countryRegions = useMemo(() => {
    return ALL_REGIONS.filter((r) => r.countryCode === activeCountry);
  }, [activeCountry]);

  // Handle letter click: set search query or letter filter
  const handleLetterClick = (letter: string) => {
    if (selectedLetter === letter) {
      setSelectedLetter(null);
      setSearchQuery('');
    } else {
      setSelectedLetter(letter);
      setSearchQuery(letter);
    }
  };

  // Scored results with intelligent prefix-first algorithm
  const scoredResults = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) {
      // If no query, return items for current country and region
      let pool = EXPANDED_LOCATIONS.filter((item) => item.countryCode === activeCountry);
      if (selectedRegionId !== 'all') {
        const currentRegion = countryRegions.find((r) => r.id === selectedRegionId);
        if (currentRegion) {
          pool = pool.filter((item) => item.region.toLowerCase() === currentRegion.name.toLowerCase());
        }
      }
      return pool.map((item) => ({
        item,
        score: 1,
        matchType: 'contains' as const
      }));
    }

    // When searching by first letters/query, run intelligent prefix matching
    return searchLocationsWithPrefix(q, {
      countryCode: activeCountry,
      limit: 60
    });
  }, [searchQuery, activeCountry, selectedRegionId, countryRegions]);

  // Top autocomplete suggestion chips (top 5 prefix matches)
  const autocompleteSuggestions = useMemo(() => {
    const q = searchQuery.trim();
    if (!q || q.length === 0) return [];

    // Filter top candidates that start with query or have high score
    return scoredResults
      .filter((r) => r.score >= 40)
      .slice(0, 5)
      .map((r) => r.item);
  }, [searchQuery, scoredResults]);

  // Handle manual location submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    const formatted = `${manualType} ${manualName.trim()}`;
    const customItem: LocationItem = {
      id: `custom-${Date.now()}`,
      name: manualName.trim(),
      type: manualType,
      region: manualRegion,
      countryCode: activeCountry,
      countryName: activeCountry === 'RU' ? 'Россия' : activeCountry === 'BY' ? 'Беларусь' : activeCountry === 'KZ' ? 'Казахстан' : 'СНГ',
      flag: activeCountry === 'RU' ? '🇷🇺' : activeCountry === 'BY' ? '🇧🇾' : activeCountry === 'KZ' ? '🇰🇿' : '🌐'
    };

    onSelect(formatted, customItem);
    onClose();
  };

  const handleSelectSettlement = (item: LocationItem) => {
    onSelect(item.name, item);
    onClose();
  };

  const handleSelectAll = () => {
    onSelect('all');
    onClose();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedLetter(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-2xs p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50 rounded-t-2xl shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">📍</span>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">
                {title}
              </h2>
              <p className="text-[11px] font-medium text-slate-500">
                Интеллектуальный поиск по РФ, Беларуси, Казахстану и СНГ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition-colors"
            title="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar with live prefix autocomplete */}
        <div className="p-3 border-b border-slate-200 bg-white shrink-0 space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (selectedLetter && (!e.target.value || !e.target.value.startsWith(selectedLetter))) {
                  setSelectedLetter(null);
                }
              }}
              placeholder="Введите первые буквы села или района (например: Шан, Окт, Мин)..."
              className="w-full pl-9 pr-9 bg-slate-100 hover:bg-slate-50 border-2 border-slate-300 focus:border-emerald-600 rounded-xl py-2 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white transition-all shadow-inner"
              autoFocus={false}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-2.5 text-xs text-slate-500 hover:text-slate-800 font-bold bg-slate-200 hover:bg-slate-300 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                title="Очистить"
              >
                ✕
              </button>
            )}
          </div>

          {/* Autocomplete Suggestion Chips: Instant 1-tap selection by first letters */}
          {autocompleteSuggestions.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
              <span className="text-[10px] font-black uppercase text-emerald-700 flex items-center gap-0.5 shrink-0">
                <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                Автоподбор:
              </span>
              {autocompleteSuggestions.map((sug) => (
                <button
                  key={`sug-${sug.id}`}
                  type="button"
                  onClick={() => handleSelectSettlement(sug)}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-900 hover:bg-emerald-600 hover:text-white border border-emerald-300 transition-all shadow-2xs active:scale-95"
                  title={`${sug.type} ${sug.name}, ${sug.region}`}
                >
                  <span>{sug.flag}</span>
                  <span className="truncate max-w-[120px]">{sug.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Cyrillic Alphabet quick letter filter bar */}
          <div className="pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px] font-bold">
              <span className="text-[10px] uppercase text-slate-400 font-black shrink-0 mr-0.5">Буква:</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedLetter(null);
                  setSearchQuery('');
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 transition-colors ${
                  !selectedLetter ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Все
              </button>
              {CYRILLIC_ALPHABET.map((letter) => {
                const isActive = selectedLetter === letter;
                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => handleLetterClick(letter)}
                    className={`w-6 h-6 rounded flex items-center justify-center font-black shrink-0 transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-2xs scale-105'
                        : 'bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-900'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick actions: Reset filter / Manual Add */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200 text-xs shrink-0">
          {allowAll && (
            <button
              type="button"
              onClick={handleSelectAll}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold border transition-colors ${
                selectedLocation === 'all'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>📍 Все сёла и регионы</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsManualEntry(!isManualEntry)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold border transition-colors ml-auto ${
              isManualEntry
                ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isManualEntry ? 'Назад к каталогу' : '+ Своё село'}</span>
          </button>
        </div>

        {/* Manual Village Entry Form if opened */}
        {isManualEntry ? (
          <form onSubmit={handleManualSubmit} className="p-4 space-y-3 overflow-y-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
              <p className="font-bold">Живёте в отдалённом посёлке или хуторе?</p>
              <p className="mt-0.5">Впишите его название, и оно сразу закрепится за вашим профилем или заявкой!</p>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                Тип поселения
              </label>
              <select
                value={manualType}
                onChange={(e) => setManualType(e.target.value as SettlementType)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
              >
                <option value="село">село</option>
                <option value="деревня">деревня</option>
                <option value="поселок">посёлок</option>
                <option value="станица">станица</option>
                <option value="хутор">хутор</option>
                <option value="аул">аул</option>
                <option value="агрогородок">агрогородок</option>
                <option value="пгт">пгт / рабочий посёлок</option>
                <option value="город">город / райцентр</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                Название населённого пункта
              </label>
              <input
                type="text"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Например: Новая Деревня"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                Регион / Область (РФ, РБ, КЗ, СНГ)
              </label>
              <select
                value={manualRegion}
                onChange={(e) => setManualRegion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
              >
                {ALL_REGIONS.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.countryCode === 'RU' ? '🇷🇺' : r.countryCode === 'BY' ? '🇧🇾' : r.countryCode === 'KZ' ? '🇰🇿' : '🌐'} {r.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={!manualName.trim()}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Выбрать «{manualType} {manualName || '...'}»</span>
            </button>
          </form>
        ) : (
          <>
            {/* If not searching: Country Tabs & Region Dropdown */}
            {!searchQuery && (
              <div className="px-3 pt-2 pb-1 bg-white border-b border-slate-200 shrink-0">
                <div className="grid grid-cols-4 gap-1">
                  {COUNTRIES.map((c) => {
                    const isActive = activeCountry === c.code;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setActiveCountry(c.code);
                          setSelectedRegionId('all');
                        }}
                        className={`py-2 px-1 rounded-xl text-center text-xs font-black transition-all flex flex-col items-center gap-0.5 border ${
                          isActive
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-base leading-none">{c.flag}</span>
                        <span className="truncate max-w-full text-[11px] leading-tight">
                          {c.code === 'RU' ? 'Россия' : c.code === 'BY' ? 'Беларусь' : c.code === 'KZ' ? 'Казахстан' : 'СНГ'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Region selector within selected country */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500 shrink-0">Регион:</span>
                  <select
                    value={selectedRegionId}
                    onChange={(e) => setSelectedRegionId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1 px-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 truncate"
                  >
                    <option value="all">Все регионы ({countryRegions.length})</option>
                    {countryRegions.map((reg) => (
                      <option key={reg.id} value={reg.id}>
                        {reg.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Settlements Scrollable List with Intelligent Highlights */}
            <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 max-h-[55vh]">
              {scoredResults.length === 0 ? (
                <div className="py-8 text-center px-4">
                  <p className="text-sm font-bold text-slate-700">Ничего не найдено по запросу «{searchQuery}»</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Проверьте написание или добавьте свой посёлок в 1 клик:
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setManualName(searchQuery);
                      setIsManualEntry(true);
                    }}
                    className="mt-3 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    + Добавить «{searchQuery || 'своё село'}»
                  </button>
                </div>
              ) : (
                scoredResults.map(({ item, matchType }) => {
                  const isCurrent = selectedLocation === item.name;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectSettlement(item)}
                      className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors ${
                        isCurrent 
                          ? 'bg-emerald-50 text-emerald-950 border border-emerald-300' 
                          : 'hover:bg-slate-50 active:bg-slate-100 text-slate-900'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-base shrink-0">{item.flag}</span>
                          <span className="font-black text-sm text-slate-900">
                            <HighlightMatch text={item.name} query={searchQuery} />
                          </span>
                          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 border border-slate-200">
                            {item.type}
                          </span>
                          {matchType === 'prefix' && searchQuery.trim() && (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-1 rounded-sm">
                              начинается на «{searchQuery.trim()}»
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                          {item.district ? `${item.district}, ` : ''}
                          <HighlightMatch text={item.region} query={searchQuery} />
                          {' • '}
                          <span>{item.countryName}</span>
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center">
                        {isCurrent ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-300" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Footer info with status count */}
        <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] font-medium text-slate-500 shrink-0">
          <span>Охват: 89 регионов РФ, Беларусь, Казахстан, СНГ</span>
          <span className="font-bold text-slate-700">{scoredResults.length} локаций</span>
        </div>
      </div>
    </div>
  );
};
