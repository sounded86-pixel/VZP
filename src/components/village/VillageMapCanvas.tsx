import React, { useState } from 'react';
import { 
  Home, MapPin, Eye, Users, Calendar, Layers, ZoomIn, ZoomOut, 
  Sparkles, Compass, ArrowRight, Shield
} from 'lucide-react';
import { VillageHouse, VillageResident, InteractiveVillage } from '../../types';

interface VillageMapCanvasProps {
  village: InteractiveVillage;
  houses: VillageHouse[];
  residents: VillageResident[];
  selectedHouseId?: string;
  onSelectHouse: (house: VillageHouse) => void;
  onOpenFamilyTree: () => void;
}

export const VillageMapCanvas: React.FC<VillageMapCanvasProps> = ({
  village,
  houses,
  residents,
  selectedHouseId,
  onSelectHouse,
  onOpenFamilyTree
}) => {
  const [hoveredHouse, setHoveredHouse] = useState<VillageHouse | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeStreetFilter, setActiveStreetFilter] = useState<string>('all');

  // Distinct streets
  const streets = Array.from(new Set(houses.map(h => h.street).filter(Boolean)));

  const filteredHouses = activeStreetFilter === 'all' 
    ? houses 
    : houses.filter(h => h.street === activeStreetFilter);

  const getResidentsForHouse = (house: VillageHouse) => {
    return residents.filter(r => house.residents.includes(r.id));
  };

  return (
    <div className="space-y-4">
      {/* Top Map Control Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="font-bold text-slate-500 whitespace-nowrap">Улицы деревни:</span>
          <button
            onClick={() => setActiveStreetFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap ${
              activeStreetFilter === 'all' 
                ? 'bg-amber-800 text-white' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Все дома ({houses.length})
          </button>
          {streets.map(street => (
            <button
              key={street}
              onClick={() => setActiveStreetFilter(street)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap ${
                activeStreetFilter === street 
                  ? 'bg-amber-800 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {street}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.1))}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
            title="Уменьшить"
          >
            <ZoomOut size={16} />
          </button>
          <span className="font-mono text-[11px] text-slate-500 font-bold">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
            title="Увеличить"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={onOpenFamilyTree}
            className="ml-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Users size={14} />
            <span>Древо деревни</span>
          </button>
        </div>
      </div>

      {/* Interactive Map Canvas Container */}
      <div className="relative w-full h-[520px] bg-[#eef7ee] rounded-3xl border-2 border-emerald-900/15 overflow-hidden shadow-inner select-none">
        
        {/* Decorative Compass Rose */}
        <div className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-xs p-2 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2 text-[10px] font-bold text-slate-700">
          <Compass size={16} className="text-emerald-700 animate-spin-slow" />
          <span>С ← Река Устья → Ю</span>
        </div>

        {/* Scalable SVG Map Landscape */}
        <div 
          className="w-full h-full relative transition-transform duration-200 origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Background SVG with River, Roads, Fields */}
          <svg className="w-full h-full absolute inset-0 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 600">
            <defs>
              <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#0284c7" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.9" />
              </linearGradient>
              <pattern id="forestPattern" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="10" fill="#15803d" opacity="0.15" />
                <circle cx="45" cy="40" r="12" fill="#166534" opacity="0.12" />
              </pattern>
            </defs>

            {/* Forest areas */}
            <rect width="1000" height="600" fill="url(#forestPattern)" />

            {/* Curving River (Река Устья) */}
            <path
              d="M 0,180 Q 250,80 500,160 T 1000,110 L 1000,190 Q 750,230 500,220 T 0,250 Z"
              fill="url(#riverGrad)"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            />
            {/* River Text */}
            <text x="480" y="195" fill="#ffffff" fontSize="13" fontWeight="bold" letterSpacing="3" opacity="0.8" fontStyle="italic">
              ~ Река Устья ~
            </text>

            {/* Main Road: ул. Центральная */}
            <path
              d="M 80,320 Q 300,310 520,340 T 920,330"
              stroke="#d97706"
              strokeWidth="14"
              strokeLinecap="round"
              fill="none"
              opacity="0.4"
            />
            <path
              d="M 80,320 Q 300,310 520,340 T 920,330"
              stroke="#ffffff"
              strokeWidth="2"
              strokeDasharray="8 8"
              fill="none"
              opacity="0.6"
            />

            {/* Secondary Road: ул. Набережная */}
            <path
              d="M 120,240 Q 320,230 500,260 T 880,240"
              stroke="#ca8a04"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
              opacity="0.35"
            />

            {/* Cross Street: ул. Заречная */}
            <path
              d="M 650,200 Q 670,360 690,520"
              stroke="#d97706"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
              opacity="0.35"
            />

            {/* Pier / Wooden bridge over the river */}
            <rect x="635" y="165" width="30" height="50" fill="#78350f" rx="3" opacity="0.8" />
            <text x="615" y="155" fill="#451a03" fontSize="10" fontWeight="bold">
              Мост / Переправа
            </text>
          </svg>

          {/* Interactive House Markers */}
          {filteredHouses.map((house) => {
            const isHovered = hoveredHouse?.id === house.id;
            const isSelected = selectedHouseId === house.id;
            const houseResidents = getResidentsForHouse(house);

            // Coordinates in percentage (fallback based on index if not set)
            const posX = house.coordinates?.mapX ?? 50;
            const posY = house.coordinates?.mapY ?? 50;

            return (
              <div
                key={house.id}
                style={{ left: `${posX}%`, top: `${posY}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer transition-transform duration-200"
                onMouseEnter={() => setHoveredHouse(house)}
                onMouseLeave={() => setHoveredHouse(null)}
                onClick={() => onSelectHouse(house)}
              >
                {/* Marker Pin */}
                <div
                  className={`group relative p-2 rounded-2xl flex items-center gap-1.5 transition-all duration-200 shadow-md ${
                    isSelected
                      ? 'bg-amber-800 text-white ring-4 ring-amber-400 scale-110 z-30'
                      : isHovered
                      ? 'bg-amber-700 text-white scale-110 z-30 ring-2 ring-amber-300'
                      : 'bg-white hover:bg-amber-50 text-slate-800 border-2 border-amber-800/40'
                  }`}
                >
                  <Home size={16} className={isSelected || isHovered ? 'text-amber-200' : 'text-amber-800'} />
                  <span className="text-[11px] font-black tracking-tight">
                    №{house.houseNumber}
                  </span>

                  {/* Pulsing ring for houses with memorial plaques */}
                  {house.memorialPlaque && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-ping opacity-75" />
                  )}
                </div>

                {/* Tooltip on Hover */}
                {isHovered && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-950 text-white p-3.5 rounded-2xl shadow-2xl border border-amber-500/30 text-left z-40 animate-in fade-in zoom-in-90 duration-150 pointer-events-none">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                      <span className="text-amber-300 font-black text-xs">
                        {house.address}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {house.yearBuilt} г.
                      </span>
                    </div>

                    {house.memorialPlaque && (
                      <div className="mb-2 bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] text-amber-200 font-bold flex items-center gap-1">
                        <Shield size={12} className="text-amber-400" />
                        <span>{house.memorialPlaque.title}</span>
                      </div>
                    )}

                    <div className="text-[11px] text-slate-300 mb-2">
                      <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">
                        Жители дома ({houseResidents.length}):
                      </span>
                      {houseResidents.length > 0 ? (
                        <div className="space-y-0.5 mt-1">
                          {houseResidents.slice(0, 3).map(r => (
                            <div key={r.id} className="truncate">
                              • {r.name} ({r.birthYear}–{r.deathYear || 'н.в.'})
                            </div>
                          ))}
                          {houseResidents.length > 3 && (
                            <div className="text-[10px] text-amber-300">
                              + ещё {houseResidents.length - 3} чел.
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Жители не добавлены</span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-amber-400 font-bold">
                      <span>Нажмите для открытия карточки</span>
                      <ArrowRight size={12} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend Overlay at Bottom Left */}
        <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-slate-200/80 shadow-md text-[11px] text-slate-700 space-y-1">
          <div className="font-black text-slate-900 text-xs mb-1">
            Легенда карты:
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded bg-amber-800 border border-amber-900"></div>
            <span>Жилой дом с жителями</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
            <span>Установлена именная табличка с QR</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1.5 bg-sky-500 rounded"></div>
            <span>Река Устья</span>
          </div>
        </div>
      </div>
    </div>
  );
};
