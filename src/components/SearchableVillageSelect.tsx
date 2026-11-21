import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, MapPin, Check, Compass, Map, X, AlertCircle, Loader2, Navigation, ChevronDown, Globe } from 'lucide-react';
import { USTYANY_VILLAGES, getVillageCoords, SETTLEMENT_COORDINATES, Village } from '../types';
import { 
  RUSSIAN_REGIONS, 
  getDistrictsForRegion, 
  getVillagesForDistrict,
  RegionInfo,
  DistrictInfo,
  VillageInfo
} from '../data/regionsData';

// Haversine formula to compute distance in km
function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

interface InteractiveMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVillage: (villageName: string) => void;
  currentVillage: string;
}

function InteractiveMapModal({ isOpen, onClose, onSelectVillage, currentVillage }: InteractiveMapModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isYmapsLoaded, setIsYmapsLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [activeSettlementFilter, setActiveSettlementFilter] = useState<string>('all');
  const mapRef = useRef<any>(null);

  // Load Yandex Maps dynamically from CDN
  useEffect(() => {
    if (!isOpen) return;

    if (!(window as any).ymaps) {
      if (!document.getElementById('yandex-maps-js')) {
        const script = document.createElement('script');
        script.id = 'yandex-maps-js';
        script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
        script.async = true;
        script.onload = () => {
          const ymaps = (window as any).ymaps;
          if (ymaps) {
            ymaps.ready(() => {
              setIsYmapsLoaded(true);
            });
          } else {
            setMapError('Не удалось инициализировать Яндекс Карты.');
          }
        };
        script.onerror = () => {
          setMapError('Не удалось загрузить Яндекс Карты. Проверьте соединение.');
        };
        document.head.appendChild(script);
      }
    } else {
      const ymaps = (window as any).ymaps;
      ymaps.ready(() => {
        setIsYmapsLoaded(true);
      });
    }
  }, [isOpen]);

  // Render Markers function
  const renderMarkers = () => {
    const map = mapRef.current;
    const ymaps = (window as any).ymaps;
    if (!map || !ymaps) return;

    // Clear previous geoObjects
    try {
      map.geoObjects.removeAll();
    } catch (e) {
      console.warn("Clear error", e);
    }

    USTYANY_VILLAGES.forEach((v) => {
      // Filter out if settlement filter is active
      if (activeSettlementFilter !== 'all' && v.settlement !== activeSettlementFilter) {
        return;
      }

      const coords = getVillageCoords(v);
      const isSelected = v.name === currentVillage;

      // Unique ID for selecting via raw html popup trigger
      const hash = v.name.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_');

      // Setup Balloon Content styled nicely for Yandex Maps Balloon
      const balloonContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 6px; min-width: 180px; max-width: 220px; line-height: 1.4;">
          <h4 style="margin: 0 0 3px 0; font-size: 13px; font-weight: 800; color: #0f172a;">${v.name}</h4>
          <p style="margin: 0 0 5px 0; font-size: 10px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 0.05em;">${v.settlement || 'Ваш район'}</p>
          <div style="margin: 0 0 8px 0; font-size: 11px; color: #64748b; font-weight: 500;">
            ${v.distance > 0 ? `~${v.distance} км от центра` : 'Административный центр'}
          </div>
          <button id="pop-select-${hash}" style="display: block; width: 100%; border: none; background-color: #059669; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.025em; padding: 7px 10px; border-radius: 8px; cursor: pointer; text-align: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: background-color 0.15s ease;">
            Выбрать населенный пункт
          </button>
        </div>
      `;

      // Draw standard placemark with label caption
      const placemark = new ymaps.Placemark(
        [coords.lat, coords.lng],
        {
          balloonContent: balloonContent,
          hintContent: v.name,
          iconCaption: v.name
        },
        {
          preset: isSelected ? 'islands#emeraldDotIconWithCaption' : 'islands#blueDotIconWithCaption',
          iconCaptionMaxWidth: '120'
        }
      );

      // Listen for balloon open to attach event handlers dynamically inside the balloon popup
      placemark.events.add('balloonopen', () => {
        // Yield execution to allow balloon to render in DOM
        setTimeout(() => {
          const btn = document.getElementById(`pop-select-${hash}`);
          if (btn) {
            btn.onclick = (e) => {
              e.preventDefault();
              onSelectVillage(v.name);
              onClose();
            };
          }
        }, 80);
      });

      map.geoObjects.add(placemark);
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!isOpen || !isYmapsLoaded || !mapContainerRef.current) return;

    const ymaps = (window as any).ymaps;
    if (!ymaps) return;

    // Default coordinates (Ustyany district / Oktyabrsky)
    const defaultLat = 61.1567;
    const defaultLng = 43.1642;

    // Destroy existing map instance to prevent canvas leakage
    if (mapRef.current) {
      try {
        mapRef.current.destroy();
      } catch (e) {
        console.warn(e);
      }
      mapRef.current = null;
    }

    try {
      const map = new ymaps.Map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 10,
        controls: ['zoomControl', 'fullscreenControl', 'geolocationControl']
      });

      mapRef.current = map;
      renderMarkers();
    } catch (e) {
      console.error("Map init error", e);
      setMapError("Произошла ошибка при загрузке карты.");
    }

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.destroy();
        } catch (e) {
          console.warn(e);
        }
        mapRef.current = null;
      }
    };
  }, [isOpen, isYmapsLoaded]);

  // Re-render markers if filter changes
  useEffect(() => {
    if (mapRef.current) {
      renderMarkers();
    }
  }, [activeSettlementFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
              <Map className="text-emerald-600" size={20} />
              <span>Карта Устьянского района</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Выберите ваш населенный пункт прямо на интерактивной карте</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Settlement list */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex flex-wrap gap-1.5 max-h-24 overflow-y-auto scrollbar-thin">
          <button
            onClick={() => setActiveSettlementFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeSettlementFilter === 'all' 
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Все ({USTYANY_VILLAGES.length})
          </button>
          {Array.from(new Set(USTYANY_VILLAGES.map(v => v.settlement).filter(Boolean))).map((s) => {
            const count = USTYANY_VILLAGES.filter(v => v.settlement === s).length;
            return (
              <button
                key={s}
                onClick={() => setActiveSettlementFilter(s || 'all')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeSettlementFilter === s 
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {s} <span className="text-[10px] opacity-75 font-mono">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Map Canvas */}
        <div className="flex-1 bg-slate-100 relative">
          {!isYmapsLoaded && !mapError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
              <Loader2 className="animate-spin text-emerald-600 mb-2" size={32} />
              <p className="text-sm font-semibold text-slate-700">Загрузка интерактивной карты...</p>
              <p className="text-xs text-slate-400 mt-1">Обычно это занимает не более пары секунд</p>
            </div>
          )}

          {mapError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-amber-50/90 p-6 text-center z-10">
              <AlertCircle className="text-amber-600 mb-2" size={36} />
              <p className="text-sm font-bold text-amber-900">{mapError}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-amber-600 text-white text-xs font-extrabold rounded-xl hover:bg-amber-700 uppercase"
              >
                Перезагрузить страницу
              </button>
            </div>
          )}

          <div ref={mapContainerRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}

interface SearchableVillageSelectProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  className?: string;
  onChangeLocation?: (loc: {
    country: string;
    region: string;
    district: string;
    village: string;
    regionCode: string;
    districtCode: string;
    villageCode: string;
  }) => void;
  currentLocation?: {
    country: string;
    region: string;
    district: string;
    village: string;
  };
  regionCode?: string;
  districtCode?: string;
  villageCode?: string;
}

export default function SearchableVillageSelect({
  value,
  onChange,
  id,
  placeholder = "Введите или выберите населенный пункт...",
  className = "",
  onChangeLocation,
  currentLocation,
  regionCode: initialRegionCode,
  districtCode: initialDistrictCode,
  villageCode: initialVillageCode
}: SearchableVillageSelectProps) {
  // Try to detect if the current value is an old Ustyany village
  const initialData = useMemo(() => {
    // 1. Check if currentLocation is passed
    if (currentLocation) {
      const regionObj = RUSSIAN_REGIONS.find(r => r.name === currentLocation.region);
      return {
        country: currentLocation.country || 'Россия',
        region: currentLocation.region || 'Архангельская область',
        regionCode: regionObj?.code || 'RU-ARK',
        district: currentLocation.district || 'Устьянский район',
        districtCode: initialDistrictCode || 'UST',
        village: currentLocation.village || value || 'Березник',
        villageCode: initialVillageCode || 'BRZ'
      };
    }

    // 2. Check if the value matches one of the old Ustyany villages
    const matchingVillage = USTYANY_VILLAGES.find(v => v.name.toLowerCase() === value?.toLowerCase());
    if (matchingVillage || value === 'Октябрьский' || value === 'Березник' || !value) {
      return {
        country: 'Россия',
        region: 'Архангельская область',
        regionCode: 'RU-ARK',
        district: 'Устьянский район',
        districtCode: 'UST',
        village: value || 'Березник',
        villageCode: matchingVillage ? matchingVillage.name.slice(0, 3).toUpperCase() : 'BRZ'
      };
    }

    // 3. Fallback to general Russia/Ustyany but with custom village name
    return {
      country: 'Россия',
      region: 'Архангельская область',
      regionCode: 'RU-ARK',
      district: 'Устьянский район',
      districtCode: 'UST',
      village: value,
      villageCode: 'CUSTOM'
    };
  }, [value, currentLocation, initialRegionCode, initialDistrictCode, initialVillageCode]);

  // Geographical State Managers
  const [selectedCountry, setSelectedCountry] = useState<string>(initialData.country);
  const [selectedRegionCode, setSelectedRegionCode] = useState<string>(initialData.regionCode);
  const [selectedRegionName, setSelectedRegionName] = useState<string>(initialData.region);
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>(initialData.district);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>(initialData.districtCode);
  const [selectedVillage, setSelectedVillage] = useState<string>(initialData.village);

  // Filter lists
  const [regionSearch, setRegionSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [villageSearch, setVillageSearch] = useState('');

  // Dropdown states
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [isVillageOpen, setIsVillageOpen] = useState(false);

  // Custom entry toggles
  const [customDistrict, setCustomDistrict] = useState(false);
  const [customVillage, setCustomVillage] = useState(false);

  // Modal map & locating
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [lastGpsDistance, setLastGpsDistance] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync back to inputs if value prop changes from outside
  useEffect(() => {
    if (value && value !== selectedVillage) {
      setSelectedVillage(value);
      setVillageSearch(value);
    }
  }, [value]);

  // Whenever any geographical parameter changes, report to parent
  const triggerLocationChange = (
    country: string,
    regName: string,
    regCode: string,
    distName: string,
    distCode: string,
    villName: string
  ) => {
    setSelectedCountry(country);
    setSelectedRegionName(regName);
    setSelectedRegionCode(regCode);
    setSelectedDistrictName(distName);
    setSelectedDistrictCode(distCode);
    setSelectedVillage(villName);

    // Call standard string change
    onChange(villName);

    // Call rich details callback if available
    if (onChangeLocation) {
      const generatedVillageCode = villName.slice(0, 3).toUpperCase();
      onChangeLocation({
        country,
        region: regName,
        district: distName,
        village: villName,
        regionCode: regCode,
        districtCode: distCode,
        villageCode: generatedVillageCode
      });
    }
  };

  // Filtered Regions based on user typing
  const filteredRegions = useMemo(() => {
    if (!regionSearch.trim()) return RUSSIAN_REGIONS;
    const s = regionSearch.toLowerCase();
    return RUSSIAN_REGIONS.filter(r => r.name.toLowerCase().includes(s));
  }, [regionSearch]);

  // Filtered Districts of current region
  const districts = useMemo(() => {
    return getDistrictsForRegion(selectedRegionCode);
  }, [selectedRegionCode]);

  const filteredDistricts = useMemo(() => {
    if (!districtSearch.trim()) return districts;
    const s = districtSearch.toLowerCase();
    return districts.filter(d => d.name.toLowerCase().includes(s));
  }, [districts, districtSearch]);

  // Filtered Villages/Settlements of current district
  const prePopulatedVillages = useMemo(() => {
    return getVillagesForDistrict(selectedRegionCode, selectedDistrictCode, selectedDistrictName);
  }, [selectedRegionCode, selectedDistrictCode, selectedDistrictName]);

  const filteredVillages = useMemo(() => {
    if (!villageSearch.trim()) return prePopulatedVillages;
    const s = villageSearch.toLowerCase();
    return prePopulatedVillages.filter(v => v.name.toLowerCase().includes(s));
  }, [prePopulatedVillages, villageSearch]);

  // Reset districts and villages when region changes
  const handleRegionSelect = (r: RegionInfo) => {
    const nextDistricts = getDistrictsForRegion(r.code);
    const defaultDist = nextDistricts[0];
    const nextVillages = getVillagesForDistrict(r.code, defaultDist.code, defaultDist.name);
    const defaultVill = nextVillages[0];

    setSelectedRegionName(r.name);
    setSelectedRegionCode(r.code);
    setSelectedDistrictName(defaultDist.name);
    setSelectedDistrictCode(defaultDist.code);
    setSelectedVillage(defaultVill.name);
    setVillageSearch(defaultVill.name);

    setIsRegionOpen(false);
    setRegionSearch('');
    setCustomDistrict(false);
    setCustomVillage(false);

    triggerLocationChange(
      'Россия',
      r.name,
      r.code,
      defaultDist.name,
      defaultDist.code,
      defaultVill.name
    );
  };

  // Change district
  const handleDistrictSelect = (d: DistrictInfo) => {
    const nextVillages = getVillagesForDistrict(selectedRegionCode, d.code, d.name);
    const defaultVill = nextVillages[0];

    setSelectedDistrictName(d.name);
    setSelectedDistrictCode(d.code);
    setSelectedVillage(defaultVill.name);
    setVillageSearch(defaultVill.name);

    setIsDistrictOpen(false);
    setDistrictSearch('');
    setCustomVillage(false);

    triggerLocationChange(
      'Россия',
      selectedRegionName,
      selectedRegionCode,
      d.name,
      d.code,
      defaultVill.name
    );
  };

  const handleCustomDistrictSubmit = (name: string) => {
    if (!name.trim()) return;
    const cleanName = name.trim();
    const customCode = `CUST-${cleanName.slice(0, 3).toUpperCase()}`;
    const nextVillages = getVillagesForDistrict(selectedRegionCode, customCode, cleanName);
    const defaultVill = nextVillages[0];

    setSelectedDistrictName(cleanName);
    setSelectedDistrictCode(customCode);
    setSelectedVillage(defaultVill.name);
    setVillageSearch(defaultVill.name);

    setIsDistrictOpen(false);
    setDistrictSearch('');

    triggerLocationChange(
      'Россия',
      selectedRegionName,
      selectedRegionCode,
      cleanName,
      customCode,
      defaultVill.name
    );
  };

  // Change village
  const handleVillageSelect = (v: VillageInfo) => {
    setSelectedVillage(v.name);
    setVillageSearch(v.name);
    setIsVillageOpen(false);

    triggerLocationChange(
      'Россия',
      selectedRegionName,
      selectedRegionCode,
      selectedDistrictName,
      selectedDistrictCode,
      v.name
    );
  };

  const handleCustomVillageSubmit = (name: string) => {
    if (!name.trim()) return;
    const cleanName = name.trim();
    setSelectedVillage(cleanName);
    setVillageSearch(cleanName);
    setIsVillageOpen(false);

    triggerLocationChange(
      'Россия',
      selectedRegionName,
      selectedRegionCode,
      selectedDistrictName,
      selectedDistrictCode,
      cleanName
    );
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsRegionOpen(false);
        setIsDistrictOpen(false);
        setIsVillageOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Geolocate user and auto-match closest village
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setGeoError("Ваш браузер не поддерживает GPS");
      return;
    }

    setIsLocating(true);
    setGeoError(null);
    setLastGpsDistance(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        let closestVillage = USTYANY_VILLAGES[0];
        let minDistance = Infinity;

        USTYANY_VILLAGES.forEach((v) => {
          const coords = getVillageCoords(v);
          const dist = getHaversineDistance(latitude, longitude, coords.lat, coords.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closestVillage = v;
          }
        });

        // Set matching region as Arkhangelsk Region, Ustyany District, matching village
        setSelectedRegionName('Архангельская область');
        setSelectedRegionCode('RU-ARK');
        setSelectedDistrictName('Устьянский район');
        setSelectedDistrictCode('UST');
        
        handleVillageSelect({ code: 'GPS-MATCH', name: closestVillage.name });
        setLastGpsDistance(minDistance);
        setIsLocating(false);
      },
      (error) => {
        console.warn("GPS selector error:", error);
        
        // Default fallback to Oktyabrsky village of Arkhangelsk / Ustyany
        setSelectedRegionName('Архангельская область');
        setSelectedRegionCode('RU-ARK');
        setSelectedDistrictName('Устьянский район');
        setSelectedDistrictCode('UST');

        handleVillageSelect({ code: 'OKT', name: 'Октябрьский' });
        setLastGpsDistance(0);
        setGeoError("Доступ к GPS заблокирован. Использована геолокация по умолчанию (пос. Октябрьский).");
        setIsLocating(false);
        
        setTimeout(() => setGeoError(null), 5000);
      },
      { timeout: 7000 }
    );
  };

  // Determine if we should show map selection button (Arkhangelsk + Ustyany specific, or default)
  const isUstyanyDistrict = selectedRegionCode === 'RU-ARK' && selectedDistrictCode === 'UST';

  return (
    <div className={`space-y-4 p-4 bg-slate-50 border border-slate-200/60 rounded-2xl ${className}`} ref={containerRef} id={id}>
      <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2">
        <MapPin size={16} className="text-emerald-600 shrink-0" />
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">📍 Где вы находитесь?</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Country (Read-Only) */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Страна</label>
          <div className="flex items-center gap-2 w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-100 text-sm font-semibold text-slate-600 cursor-not-allowed">
            <Globe size={15} className="text-slate-400" />
            <span>🇷🇺 {selectedCountry}</span>
          </div>
        </div>

        {/* Region */}
        <div className="relative">
          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Регион</label>
          <button
            type="button"
            onClick={() => {
              setIsRegionOpen(!isRegionOpen);
              setIsDistrictOpen(false);
              setIsVillageOpen(false);
            }}
            className="flex items-center justify-between w-full px-3.5 py-2.5 border-2 border-slate-200 focus:border-brand-medium rounded-xl bg-white text-sm font-bold text-slate-800 transition-all hover:bg-slate-50 text-left"
          >
            <span className="truncate">{selectedRegionName}</span>
            <ChevronDown size={14} className="text-slate-400 shrink-0" />
          </button>

          {isRegionOpen && (
            <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl divide-y divide-slate-100">
              <div className="p-2 sticky top-0 bg-white z-10">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Поиск региона..."
                    value={regionSearch}
                    onChange={(e) => setRegionSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:border-emerald-500 focus:outline-none font-medium"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <div className="py-1">
                {filteredRegions.map((r) => (
                  <button
                    key={r.code}
                    type="button"
                    onClick={() => handleRegionSelect(r)}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors hover:bg-slate-50 flex items-center justify-between ${
                      r.code === selectedRegionCode ? "text-emerald-600 bg-emerald-50/40" : "text-slate-700"
                    }`}
                  >
                    <span>{r.name}</span>
                    {r.code === selectedRegionCode && <Check size={12} className="text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* District */}
        <div className="relative">
          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Район / Округ</label>
          <button
            type="button"
            onClick={() => {
              setIsDistrictOpen(!isDistrictOpen);
              setIsRegionOpen(false);
              setIsVillageOpen(false);
            }}
            className="flex items-center justify-between w-full px-3.5 py-2.5 border-2 border-slate-200 focus:border-brand-medium rounded-xl bg-white text-sm font-bold text-slate-800 transition-all hover:bg-slate-50 text-left"
          >
            <span className="truncate">{selectedDistrictName}</span>
            <ChevronDown size={14} className="text-slate-400 shrink-0" />
          </button>

          {isDistrictOpen && (
            <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl divide-y divide-slate-100">
              <div className="p-2 sticky top-0 bg-white z-10 space-y-1.5">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Поиск района..."
                    value={districtSearch}
                    onChange={(e) => setDistrictSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:border-emerald-500 focus:outline-none font-medium"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                {!customDistrict ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCustomDistrict(true);
                    }}
                    className="w-full py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-bold text-center transition-all"
                  >
                    ✍️ Ввести свой район вручную
                  </button>
                ) : (
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      placeholder="Название района..."
                      id="custom-district-input"
                      className="flex-1 px-2 py-1 border border-slate-200 rounded text-xs focus:border-emerald-500 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCustomDistrictSubmit((e.target as HTMLInputElement).value);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('custom-district-input') as HTMLInputElement;
                        if (el) handleCustomDistrictSubmit(el.value);
                      }}
                      className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold"
                    >
                      ОК
                    </button>
                  </div>
                )}
              </div>
              <div className="py-1">
                {filteredDistricts.map((d) => (
                  <button
                    key={d.code}
                    type="button"
                    onClick={() => handleDistrictSelect(d)}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors hover:bg-slate-50 flex items-center justify-between ${
                      d.name === selectedDistrictName ? "text-emerald-600 bg-emerald-50/40" : "text-slate-700"
                    }`}
                  >
                    <span>{d.name}</span>
                    {d.name === selectedDistrictName && <Check size={12} className="text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Village/Settlement */}
        <div className="relative">
          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Населенный пункт</label>
          <button
            type="button"
            onClick={() => {
              setIsVillageOpen(!isVillageOpen);
              setIsRegionOpen(false);
              setIsDistrictOpen(false);
            }}
            className="flex items-center justify-between w-full px-3.5 py-2.5 border-2 border-slate-200 focus:border-brand-medium rounded-xl bg-white text-sm font-bold text-slate-800 transition-all hover:bg-slate-50 text-left"
          >
            <span className="truncate">{selectedVillage}</span>
            <ChevronDown size={14} className="text-slate-400 shrink-0" />
          </button>

          {isVillageOpen && (
            <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl divide-y divide-slate-100">
              <div className="p-2 sticky top-0 bg-white z-10 space-y-1.5">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Поиск населенного пункта..."
                    value={villageSearch}
                    onChange={(e) => setVillageSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:border-emerald-500 focus:outline-none font-medium"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                {!customVillage ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCustomVillage(true);
                    }}
                    className="w-full py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-bold text-center transition-all"
                  >
                    ✍️ Ввести населенный пункт вручную
                  </button>
                ) : (
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      placeholder="Название деревни/села..."
                      id="custom-village-input"
                      className="flex-1 px-2 py-1 border border-slate-200 rounded text-xs focus:border-emerald-500 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCustomVillageSubmit((e.target as HTMLInputElement).value);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('custom-village-input') as HTMLInputElement;
                        if (el) handleCustomVillageSubmit(el.value);
                      }}
                      className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold"
                    >
                      ОК
                    </button>
                  </div>
                )}
              </div>
              <div className="py-1">
                {filteredVillages.map((v) => (
                  <button
                    key={v.code}
                    type="button"
                    onClick={() => handleVillageSelect(v)}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors hover:bg-slate-50 flex items-center justify-between ${
                      v.name === selectedVillage ? "text-emerald-600 bg-emerald-50/40" : "text-slate-700"
                    }`}
                  >
                    <span>{v.name}</span>
                    {v.name === selectedVillage && <Check size={12} className="text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Geolocate & Interactive Map buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleGeolocate}
          disabled={isLocating}
          className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 disabled:bg-slate-100 text-slate-700 rounded-xl text-[11px] font-extrabold tracking-wide transition-all flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer uppercase"
        >
          {isLocating ? (
            <Loader2 size={13} className="animate-spin text-emerald-600" />
          ) : (
            <Compass size={13} className="text-emerald-600" />
          )}
          <span>{isLocating ? "Определение..." : "Определить по GPS"}</span>
        </button>

        {isUstyanyDistrict && (
          <button
            type="button"
            onClick={() => setIsMapOpen(true)}
            className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-[11px] font-extrabold tracking-wide transition-all flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer uppercase"
          >
            <Map size={13} className="text-emerald-600" />
            <span>Выбрать на карте Устьян</span>
          </button>
        )}
      </div>

      {/* GPS info and feedback alerts */}
      {lastGpsDistance !== null && (
        <div className="mt-1 bg-emerald-50 border border-emerald-100 text-emerald-800 px-3.5 py-1.5 text-[10px] rounded-xl font-medium flex items-center gap-1.5">
          <Navigation size={10} className="text-emerald-600 animate-pulse shrink-0" />
          <span>Местоположение успешно определено! Выбран {selectedRegionName}, {selectedDistrictName}, {selectedVillage}.</span>
        </div>
      )}

      {geoError && (
        <div className="mt-1 bg-amber-50 border border-amber-100 text-amber-800 px-3.5 py-1.5 text-[10px] rounded-xl font-medium flex items-center gap-1.5">
          <AlertCircle size={10} className="text-amber-600 shrink-0" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Map selection popup modal */}
      <InteractiveMapModal 
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onSelectVillage={(villName) => {
          handleVillageSelect({ code: 'MAP-MATCH', name: villName });
        }}
        currentVillage={selectedVillage}
      />
    </div>
  );
}
